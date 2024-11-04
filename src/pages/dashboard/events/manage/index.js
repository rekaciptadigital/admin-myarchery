import * as React from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useWizardView } from "utils/hooks/wizard-view";
import { eventConfigs, eventCategories } from "constants/index";
import { eventDataReducer } from "../hooks/create-event-data";
import { EventsService } from "services";

import MetaTags from "react-meta-tags";
import SweetAlert from "react-bootstrap-sweetalert";
import { Container, Row, Col } from "reactstrap";
import { StepList, WizardView, WizardViewContent, Button, ButtonBlue } from "components/ma";
import { StepInfoUmum, StepBiaya, StepKategori } from "../components/manage-fullday";
import { PreviewPortal } from "../components/manage-fullday/preview";
import { BreadcrumbDashboard } from "../components/breadcrumb";

import IconAlertTriangle from "components/ma/icons/mono/alert-triangle";

import { format, isPast, parseISO } from "date-fns";
import { stringUtil } from "utils";

import illustrationAlertPublication from "assets/images/events/alert-publication.svg";
import "pages/dashboard/events/style-overrides/main-content.scss";

const stepsData = [
  {
    step: 1,
    label: "Informasi Umum",
    description: "Banner dan informasi mengenai event Anda",
  },
  {
    step: 2,
    label: "Kategori Lomba",
    description: "Pengaturan kategori beserta detailnya",
  },
  {
    step: 3,
    label: "Biaya Registrasi",
    description: "Pengaturan biaya pendaftaran pertandingan",
  },
];

const { EVENT_TYPES, MATCH_TYPES } = eventConfigs;
const { TEAM_CATEGORIES } = eventCategories;

const initialEventCategoryKey = stringUtil.createRandom();
const initialDetailKey = stringUtil.createRandom();
const initialEventData = {
  eventType: EVENT_TYPES.FULLDAY,
  eventCompetition: MATCH_TYPES.TOURNAMENT,
  eventName: "",
  description: "",
  location: "",
  locationType: "",
  city: "",
  extraInfos: [],
  handbook: null,
  eventCategories: [
    {
      key: initialEventCategoryKey,
      competitionCategory: null,
      categoryDetails: [
        {
          key: initialDetailKey,
          categoryKey: initialEventCategoryKey,
          competitionCategory: "",
          ageCategory: null,
          teamCategory: null,
          distance: [],
          quota: "",
        },
      ],
    },
  ],
  isFlatRegistrationFee: true,
  registrationFee: "",
  registrationFees: [
    { key: 1, teamCategory: TEAM_CATEGORIES.TEAM_INDIVIDUAL, amount: "" },
    { key: 2, teamCategory: TEAM_CATEGORIES.TEAM_MALE, amount: "" },
    { key: 3, teamCategory: TEAM_CATEGORIES.TEAM_FEMALE, amount: "" },
    { key: 4, teamCategory: TEAM_CATEGORIES.TEAM_MIXED, amount: "" },
  ],
  earlyBirdRegistrationFee: "",
  earlyBirdRegistrationFees: [
    { key: 1, teamCategory: TEAM_CATEGORIES.TEAM_INDIVIDUAL, amount: "" },
    { key: 2, teamCategory: TEAM_CATEGORIES.TEAM_MALE, amount: "" },
    { key: 3, teamCategory: TEAM_CATEGORIES.TEAM_FEMALE, amount: "" },
    { key: 4, teamCategory: TEAM_CATEGORIES.TEAM_MIXED, amount: "" },
  ],
  dateEarlyBird: null,
};

const PageEventDetailManage = () => {
  const history = useNavigate();
  const { event_id } = useParams();
  const { steps, stepsTotal, currentStep, currentLabel, goToStep, goToPreviousStep, goToNextStep } =
    useWizardView(stepsData);
  const [eventData, updateEventData] = React.useReducer(eventDataReducer, initialEventData);
  const [isFormDirty, setFormDirty] = React.useState(false);
  const [shouldShowSavingWarning, setShowSavingWarning] = React.useState(false);
  const { validate: validateForm, errors: validationErrors } = useEventDataValidation(eventData);
  const [isEventPublished, setIsEventPublished] = React.useState(true);
  const [fetchingEventStatus, setFetchingEventStatus] = React.useState({
    status: "idle",
    errors: null,
    attemptCounts: 0,
  });
  const [savingEventStatus, setSavingEventStatus] = React.useState({
    status: "idle",
    errors: null,
  });
  const [shouldShowPreview, setShouldShowPreview] = React.useState(false);
  const [shouldShowConfirmPublication, setShouldShowConfirmPublication] = React.useState(false);

  const eventId = parseInt(event_id);
  const isLoading = savingEventStatus.status === "loading";
  const isErrorSubmiting = savingEventStatus.status === "error";

  const editIsDisabled = shouldDisableEditing(eventData?.eventDateEnd);

  const incrementAttemptCounts = () => {
    setFetchingEventStatus((state) => ({
      ...state,
      attemptCounts: state.attemptCounts + 1,
    }));
  };

  const handleClickSave = async (stepNumber) => {
    if (!isFormDirty) {
      return;
    }

    // reset to clean state
    setFormDirty(false);
    setShowSavingWarning(false);

    if (stepNumber === 1) {
      validateForm({
        step: stepNumber,
        onValid: () => handleSaveEventDetails(),
      });
    } else if (stepNumber === 2) {
      validateForm({
        step: stepNumber,
        onValid: () => handleSaveCategoryDetails(),
      });
    } else if (stepNumber === 3) {
      // Field-field kosong di registration fees gak perlu divalidasi
      handleSaveRegistrationFees();
    }
  };

  const handleSaveEventDetails = async () => {
    setSavingEventStatus((state) => ({ ...state, status: "loading", errors: null }));
    const payload = await makeEventDetailsPayload({ event_id: eventId, ...eventData });
    const result = await EventsService.updateEvent(payload);
    if (result.success) {
      setSavingEventStatus((state) => ({ ...state, status: "success" }));
      incrementAttemptCounts();
    } else {
      setSavingEventStatus((state) => ({
        ...state,
        status: "error",
        errors: result.message ? "Mohon cek koneksi internet Anda." : result.errors,
      }));
    }
  };

  const handleSaveCategoryDetails = async () => {
    setSavingEventStatus((state) => ({ ...state, status: "loading", errors: null }));
    const payload = makeCategoryDetailsPayload({ event_id: eventId, ...eventData });
    const result = await EventsService.updateCategoryDetails(payload);
    if (result.success) {
      setSavingEventStatus((state) => ({ ...state, status: "success" }));
      incrementAttemptCounts();
    } else {
      setSavingEventStatus((state) => ({
        ...state,
        status: "error",
        errors: result.message ? "Mohon cek koneksi internet Anda." : result.errors,
      }));
    }
  };

  const handleSaveRegistrationFees = async () => {
    setSavingEventStatus((state) => ({ ...state, status: "loading", errors: null }));
    const payload = makeFeesPayload({ event_id: eventId, ...eventData });
    const result = await EventsService.updateCategoryFee(payload);
    if (result.success) {
      setSavingEventStatus((state) => ({ ...state, status: "success" }));
      incrementAttemptCounts();
    } else {
      setSavingEventStatus((state) => ({
        ...state,
        status: "error",
        errors: result.message ? "Mohon cek koneksi internet Anda." : result.errors,
      }));
    }
  };

  const handleClickPublish = () => {
    if (isFormDirty) {
      setShowSavingWarning(true);
      setTimeout(() => {
        setShowSavingWarning(false);
      }, 3000);
      return;
    }
    setShouldShowConfirmPublication(true);
  };

  const handleCancelPublish = () => setShouldShowConfirmPublication(false);

  const handlePublishEvent = async () => {
    setSavingEventStatus((state) => ({ ...state, status: "loading", errors: null }));

    const result = await EventsService.setPublished({ status: 1 }, { id: eventId });
    if (result.success) {
      setSavingEventStatus((state) => ({ ...state, status: "success" }));
      eventId && history.push(`/dashboard/events/new/prepublish?eventId=${eventId}`);
    } else {
      setSavingEventStatus((state) => ({
        ...state,
        status: "error",
        errors: result.message ? "Mohon cek koneksi internet Anda." : result.errors,
      }));
    }
  };

  React.useEffect(() => {
    const getEventDetail = async () => {
      setFetchingEventStatus((state) => ({ ...state, status: "loading", errors: null }));
      const result = await EventsService.getEventDetailById({ id: eventId });
      if (result.success) {
        setFetchingEventStatus((state) => ({ ...state, status: "success" }));
        const eventDetailData = makeEventDetailState(result.data);
        updateEventData(eventDetailData);
        setIsEventPublished(Boolean(result.data.publicInformation.eventStatus));
      } else {
        setFetchingEventStatus((state) => ({
          ...state,
          status: "error",
          errors: result.message ? "Mohon cek koneksi internet Anda." : result.errors,
        }));
      }
    };
    getEventDetail();
  }, [fetchingEventStatus.attemptCounts]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  return (
    <React.Fragment>
      <StyledPageWrapper>
        <MetaTags>
          <title>Atur Pertandingan | MyArchery.id</title>
        </MetaTags>

        <Container fluid>
          <BreadcrumbDashboard to={`/dashboard/event/${eventId}/home`}>Kembali</BreadcrumbDashboard>

          <StickyContainer>
            <StickyItem>
              <StepList
                steps={steps}
                currentStep={currentStep}
                onChange={(ev) => goToStep(ev.target.value)}
              >
                Pertandingan
              </StepList>
            </StickyItem>

            <StickyItemSibling>
              <RowStickyHeader>
                <Col>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h2>{currentLabel}</h2>
                      <p>{steps[currentStep - 1].description}</p>
                    </div>

                    <div>
                      <div
                        className="d-flex justify-content-end"
                        style={{ position: "relative", gap: "0.5rem" }}
                      >
                        {!isEventPublished ? (
                          <React.Fragment>
                            <Button
                              onClick={() => handleClickSave(currentStep)}
                              disabled={editIsDisabled}
                            >
                              Simpan
                            </Button>

                            <ButtonBlue onClick={handleClickPublish}>Publikasi</ButtonBlue>
                          </React.Fragment>
                        ) : (
                          <ButtonBlue
                            onClick={() => handleClickSave(currentStep)}
                            disabled={editIsDisabled}
                          >
                            Simpan
                          </ButtonBlue>
                        )}

                        {shouldShowSavingWarning && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-1.75rem",
                              right: 0,
                              width: "300px",
                              textAlign: "right",
                            }}
                          >
                            <span
                              style={{
                                padding: "0.1rem 0.4rem",
                                borderRadius: 6,
                                backgroundColor: "var(--ma-yellow)",
                                color: "var(--ma-blue)",
                              }}
                            >
                              Simpan suntingan data terlebih dahulu
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </RowStickyHeader>

              <div className="content-scrollable flex-grow-1 mb-5">
                <div className="content-scrollable-inner">
                  <WizardView currentStep={currentStep}>
                    <WizardViewContent>
                      <StepInfoUmum
                        eventId={eventId}
                        editIsAllowed={!editIsDisabled}
                        savingStatus={savingEventStatus}
                        onSaveSuccess={() => incrementAttemptCounts()}
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[1] || {}}
                        isFormDirty={isFormDirty}
                        setFormDirty={setFormDirty}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepKategori
                        eventId={eventId}
                        editIsAllowed={!editIsDisabled}
                        savingStatus={savingEventStatus}
                        eventData={eventData}
                        updateEventData={updateEventData}
                        onSaveSuccess={() => incrementAttemptCounts()}
                        validationErrors={validationErrors[2] || {}}
                        isFormDirty={isFormDirty}
                        setFormDirty={setFormDirty}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepBiaya
                        editIsAllowed={!editIsDisabled}
                        savingStatus={savingEventStatus}
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[3] || {}}
                        isFormDirty={isFormDirty}
                        setFormDirty={setFormDirty}
                      />
                    </WizardViewContent>
                  </WizardView>

                  {currentStep <= stepsTotal && (
                    <div
                      className="mx-auto d-flex justify-content-around align-items-center flex-wrap"
                      style={{ color: "#0D47A1", maxWidth: "300px" }}
                    >
                      {currentStep > 1 && (
                        <a onClick={() => goToPreviousStep()}>
                          <i className="mdi mdi-chevron-up" />
                          <span className="ms-1">
                            {stepsData.find((step) => step.step === currentStep - 1).label}
                          </span>
                        </a>
                      )}

                      {currentStep < stepsTotal && (
                        <a onClick={() => goToNextStep()}>
                          <i className="mdi mdi-chevron-down" />
                          <span className="ms-1">
                            {stepsData.find((step) => step.step === currentStep + 1).label}
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </StickyItemSibling>
          </StickyContainer>
        </Container>
      </StyledPageWrapper>

      <AlertConfirmPublication
        showAlert={shouldShowConfirmPublication}
        onPublish={() => {
          handlePublishEvent();
          setShouldShowConfirmPublication(false);
        }}
        onPreview={() => {
          setShouldShowPreview(true);
          setShouldShowConfirmPublication(false);
        }}
        onCancel={handleCancelPublish}
      />

      <PreviewPortal
        isActive={shouldShowPreview}
        isLoading={isLoading}
        eventData={eventData}
        onClose={() => setShouldShowPreview(false)}
        onPublish={() => {
          handlePublishEvent();
          setShouldShowPreview(false);
        }}
      />
      <AlertSubmitError isError={isErrorSubmiting} errors={savingEventStatus.errors} />
    </React.Fragment>
  );
};

const StyledPageWrapper = styled.div`
  margin: 2.5rem 0;
`;

const StickyContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.5rem;
`;

const StickyItem = styled.div`
  position: sticky;
  z-index: 100;
  @media (max-width: 782px) {
    position: static;
  }

  top: calc(70px + 2.5rem);
  flex: 1 1 15rem;
`;

const StickyItemSibling = styled.div`
  flex: 12 1 30rem;
`;

const RowStickyHeader = styled(Row)`
  position: sticky;
  top: 2.5rem;
  z-index: 80;
  background-color: var(--bs-body-bg);
  padding-top: var(--ma-header-height);
  margin-top: calc(-1 * var(--ma-header-height));
`;

function AlertConfirmPublication({ showAlert, onPublish, onPreview, onCancel }) {
  return (
    <SweetAlert
      show={showAlert}
      title=""
      custom
      btnSize="md"
      onConfirm={onPublish}
      onCancel={onCancel}
      style={{ width: 800, padding: "35px 88px", borderRadius: "1.25rem" }}
      customButtons={
        <span className="d-flex justify-content-center" style={{ gap: "0.5rem", width: "100%" }}>
          <ButtonBlue onClick={onPublish} style={{ minWidth: 120 }}>
            Publikasi
          </ButtonBlue>

          <Button onClick={onPreview} style={{ minWidth: 120, color: "var(--ma-blue)" }}>
            Pratinjau
          </Button>
        </span>
      }
    >
      <IllustationAlertPublication />
      <h4>Lakukan Publikasi?</h4>
      <p className="text-muted">
        Klik Publikasi untuk publikasi event atau klik Pratinjau untuk memastikan ulang informasi
        yang akan ditampilkan.
      </p>
    </SweetAlert>
  );
}

const IllustationAlertPublication = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  min-height: 188px;
  background-image: url(${illustrationAlertPublication});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
`;

function AlertSubmitError({ isError, errors, onConfirm }) {
  const [isAlertOpen, setAlertOpen] = React.useState(false);

  const renderErrorMessages = () => {
    if (errors && typeof errors === "string") {
      return errors;
    }

    if (errors) {
      const fields = Object.keys(errors);
      const messages = fields.map(
        (field) => `${errors[field].map((message) => `- ${message}\n`).join("")}`
      );

      if (messages.length) {
        return `${messages.join("")}`;
      }
    }

    return "Error tidak diketahui.";
  };

  const handleConfirm = () => {
    setAlertOpen(false);
    onConfirm?.();
  };

  React.useEffect(() => {
    if (!isError) {
      return;
    }
    setAlertOpen(true);
  }, [isError]);

  return (
    <React.Fragment>
      <SweetAlert
        show={isAlertOpen}
        title=""
        custom
        btnSize="md"
        style={{ padding: "30px 40px", width: "720px" }}
        onConfirm={handleConfirm}
        customButtons={
          <span className="d-flex flex-column w-100">
            <ButtonBlue onClick={handleConfirm}>Tutup</ButtonBlue>
          </span>
        }
      >
        <h4>
          <IconAlertTriangle />
        </h4>
        <div className="text-start">
          <p>
            Terdapat kendala teknis dalam memproses data. Coba kembali beberapa saat lagi, atau
            silakan berikan pesan error berikut kepada technical support:
          </p>
          <pre className="p-3" style={{ backgroundColor: "var(--ma-gray-100)" }}>
            {renderErrorMessages()}
          </pre>
        </div>
      </SweetAlert>
    </React.Fragment>
  );
}

function shouldDisableEditing(eventDateEnd) {
  if (!eventDateEnd) {
    return true;
  }
  return isPast(eventDateEnd);
}

function makeEventDetailState(initialData) {
  const { publicInformation, moreInformation, eventCategories } = initialData;

  const eventCategoriesState = makeCategoryDetailState(eventCategories);
  const feesState = makeRegistrationFeesState(eventCategories);
  const {
    isFlatRegistrationFee,
    registrationFee,
    registrationFees,
    earlyBirdRegistrationFee,
    earlyBirdRegistrationFees,
    registrationFeesID,
    earlyRegistrationFeesID,
    dateEarlyBird,
  } = feesState;

  return {
    status: publicInformation.eventStatus,
    eventName: publicInformation.eventName,
    bannerImage: { originalUrl: publicInformation.eventBanner, raw: null, preview: null },
    description: publicInformation.eventDescription,
    location: publicInformation.eventLocation,
    locationType: publicInformation.eventLocationType,
    city: {
      label: publicInformation.eventCity.nameCity,
      value: publicInformation.eventCity.cityId,
    },
    registrationDateStart: parseISO(publicInformation.eventStartRegister),
    registrationDateEnd: parseISO(publicInformation.eventEndRegister),
    eventDateStart: parseISO(publicInformation.eventStart),
    eventDateEnd: parseISO(publicInformation.eventEnd),
    extraInfos: moreInformation.map((info) => ({
      key: stringUtil.createRandom(),
      // Butuh ID untuk edit dan hapus.
      // Belum ada di data respon.
      id: info.id || "",
      eventId: info.eventId,
      title: info.title,
      description: info.description,
    })),
    registrationFeesID: registrationFeesID,
    earlyRegistrationFeesID: earlyRegistrationFeesID,
    eventCategories: eventCategoriesState,
    isFlatRegistrationFee,
    registrationFee,
    registrationFees,
    earlyBirdRegistrationFee,
    earlyBirdRegistrationFees,
    dateEarlyBird,
  };
}

function makeCategoryDetailState(categoryDetailData) {
  const sortedCategoryDetail = categoryDetailData.sort((a, b) => {
    if (a.categoryDetailsId === b.categoryDetailsId) {
      return 0;
    }
    if (a.categoryDetailsId < b.categoryDetailsId) {
      return -1;
    }
    return 1;
  });

  const groupedCategoryDetail = {};
  for (const detail of sortedCategoryDetail) {
    const { competitionCategoryId } = detail;
    if (!groupedCategoryDetail[competitionCategoryId.label]) {
      groupedCategoryDetail[competitionCategoryId.label] = [];
    }
    groupedCategoryDetail[competitionCategoryId.label].push(detail);
  }

  const eventCategories = [];
  for (const competitionCategoryId in groupedCategoryDetail) {
    const eventCategoryKey = stringUtil.createRandom();
    const competitionGroup = {
      key: eventCategoryKey,
      competitionCategory: { label: competitionCategoryId, value: competitionCategoryId },
      categoryDetails: groupedCategoryDetail[competitionCategoryId].map((detail) => ({
        key: stringUtil.createRandom(),
        categoryDetailsId: detail.categoryDetailsId,
        categoryKey: eventCategoryKey,
        competitionCategory: detail.competitionCategoryId,
        ageCategory: detail.ageCategoryId
          ? { value: detail.ageCategoryId.id, label: detail.ageCategoryId.label }
          : null,
        teamCategory: detail.teamCategoryId
          ? { value: detail.teamCategoryId.id, label: detail.teamCategoryId.label }
          : null,
        distance: detail.distanceId
          ? { value: detail.distanceId.id, label: detail.distanceId.label }
          : null,
        quota: detail.quota,
        fee: Number(detail.fee),
        early_bird: Number(detail.earlyBird),
      })),
    };
    eventCategories.push(competitionGroup);
  }

  return eventCategories;
}

function makeRegistrationFeesState(eventCategories) {
  const registrationFees = [];
  const earlyBirdRegistrationFees = [];
  const registrationFeesID = [];
  const earlyRegistrationFeesID = [];

  let checkFee = -1;
  let checkFeeEarly = -1;
  let isFlatRegistrationFee = true;
  for (const category of eventCategories) {
    if (isFlatRegistrationFee && checkFee >= 0 && checkFee != Number(category.fee))
      isFlatRegistrationFee = false;

    registrationFees.push({
      teamCategory: category.teamCategoryId.id,
      amount: Number(category.fee),
    });

    earlyBirdRegistrationFees.push({
      teamCategory: category.teamCategoryId.id,
      amount: Number(category.earlyBird),
    });
    checkFee = Number(category.fee);
    checkFeeEarly = Number(category?.earlyBird);
    registrationFeesID[category.teamCategoryId.id] = 1;
    earlyRegistrationFeesID[category.teamCategoryId.id] = 1;
  }

  const registrationFee = isFlatRegistrationFee ? checkFee : "";
  const earlyBirdRegistrationFee = isFlatRegistrationFee ? checkFeeEarly : "";

  return {
    isFlatRegistrationFee,
    registrationFee,
    earlyBirdRegistrationFee,
    registrationFees: registrationFees,
    earlyBirdRegistrationFees: earlyBirdRegistrationFees,
    registrationFeesID,
    earlyRegistrationFeesID,
  };
}

// old func
// function makeRegistrationFeesState(eventCategories) {
//   const registrationFees = [];
//   const uniqueTeams = new Set();
//   const uniqueFees = new Set();

//   for (const category of eventCategories) {
//     if (registrationFees.length >= 4) {
//       break;
//     }
//     if (!category.teamCategoryId) {
//       continue;
//     }

//     const targetTeam =
//       category.teamCategoryId.id === TEAM_CATEGORIES.TEAM_INDIVIDUAL_MALE ||
//       category.teamCategoryId.id === TEAM_CATEGORIES.TEAM_INDIVIDUAL_FEMALE
//         ? TEAM_CATEGORIES.TEAM_INDIVIDUAL
//         : category.teamCategoryId.id;

//     if (!uniqueTeams.has(targetTeam)) {
//       uniqueTeams.add(targetTeam);
//       uniqueFees.add(Number(category.fee));
//       registrationFees.push({ teamCategory: targetTeam, amount: Number(category.fee) });
//     }
//   }

//   const isFlatRegistrationFee = uniqueFees.size === 1;
//   const registrationFee = isFlatRegistrationFee ? [...uniqueFees][0] : "";

//   return {
//     isFlatRegistrationFee,
//     registrationFee,
//     registrationFees: isFlatRegistrationFee ? [] : registrationFees,
//   };
// }

async function makeEventDetailsPayload(eventData) {
  const bannerImageBase64 = eventData.bannerImage?.raw
    ? await imageToBase64(eventData.bannerImage.raw)
    : undefined;
  const handbookBase64 = eventData.handbook ? await imageToBase64(eventData.handbook) : null;

  return {
    id: eventData.event_id,
    eventType: "Full_day",
    eventCompetition: "Tournament",
    handbook: handbookBase64,
    status: eventData.status, // kirim status apapun yang ada sekarang
    eventName: eventData.eventName,
    eventBanner: bannerImageBase64, // harus opsional
    eventDescription: eventData.description,
    eventLocation: eventData.location,
    eventCity: eventData.city?.value,
    eventLocation_type: eventData.locationType,
    eventStart_register: formatServerDatetime(eventData.registrationDateStart),
    eventEnd_register: formatServerDatetime(eventData.registrationDateEnd),
    eventStart: formatServerDatetime(eventData.eventDateStart),
    eventEnd: formatServerDatetime(eventData.eventDateEnd),
  };
}

function makeCategoryDetailsPayload(eventData) {
  const { eventCategories } = eventData;

  const generatedCategories = [];
  eventCategories.forEach((competition) => {
    competition.categoryDetails?.forEach((detail) => {
      const newCategory = {
        event_id: eventData.event_id,
        id: detail.categoryDetailsId,
        competition_category_id: competition.competitionCategory?.value,
        age_category_id: detail.ageCategory?.value,
        distance_id: detail.distance.value,
        quota: detail.quota,
        team_category_id: detail.teamCategory?.value,
        fee: detail.fee, // harusnya opsional, disertakan aja biar gak error 500 dari server
      };
      generatedCategories.push(newCategory);
    });
  });

  return { data: generatedCategories };
}

function makeFeesPayload(eventData) {
  let newDateEarly = new Date(eventData?.dateEarlyBird)
  let early_date_bird = `${newDateEarly.getFullYear()}-${newDateEarly.getMonth()+1}-${newDateEarly.getDate()}`
  if (eventData.isFlatRegistrationFee || !eventData.registrationFees?.length) {
    const teamCategories = [
      TEAM_CATEGORIES.TEAM_INDIVIDUAL_MALE,
      TEAM_CATEGORIES.TEAM_INDIVIDUAL_FEMALE,
      TEAM_CATEGORIES.TEAM_MALE,
      TEAM_CATEGORIES.TEAM_FEMALE,
      TEAM_CATEGORIES.TEAM_MIXED,
    ];

    return {
      event_id: eventData.event_id,
      data: teamCategories.map((teamCategory) => ({
        team_category_id: teamCategory,
        fee: eventData.registrationFee || 0,
        end_date_early_bird: early_date_bird || null,
        early_bird: eventData?.earlyBirdRegistrationFee || 0,
      })),
    };
  }

  const feesData = [];
  for (const fee of eventData.registrationFees) {
    if (fee.teamCategory === TEAM_CATEGORIES.TEAM_INDIVIDUAL) {
      feesData.push({
        team_category_id: TEAM_CATEGORIES.TEAM_INDIVIDUAL_MALE,
        fee: fee.amount || 0,
        end_date_early_bird: early_date_bird || null,
      });
      feesData.push({
        team_category_id: TEAM_CATEGORIES.TEAM_INDIVIDUAL_FEMALE,
        fee: fee.amount || 0,
        end_date_early_bird: early_date_bird || null,
      });
    } else {
      feesData.push({
        team_category_id: fee.teamCategory,
        fee: fee.amount || 0,
        end_date_early_bird: early_date_bird || null,
      });
    }
  }

  let i = 0;
  for (const early of eventData?.earlyBirdRegistrationFees) {
    feesData[i].early_bird = early?.amount;
    i += 1;
  }

  return {
    event_id: eventData.event_id,
    data: feesData,
  };
}

function formatServerDatetime(date) {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

async function imageToBase64(imageFileRaw) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFileRaw);
    reader.onload = () => {
      const baseURL = reader.result;
      resolve(baseURL);
    };
  });
}

function useEventDataValidation(eventData) {
  const [validation, setValidation] = React.useState({ errors: {} });
  const { errors: validationErrors } = validation;
  const isValid = !Object.keys(validationErrors)?.length;

  const ValidationErrors = ValidationErrorsByStep(validationErrors);

  const validate = ({ step, onValid, onInvalid }) => {
    const Step1 = StepGroupValidation();
    const Step2 = StepGroupValidation();

    // STEP 1: Informasi Umum
    Step1.validate("eventName", () => {
      if (!eventData.eventName) {
        return "Wajib diisi";
      }
    });

    Step1.validate("location", () => {
      if (!eventData.location) {
        return "Wajib diisi";
      }
    });

    Step1.validate("locationType", () => {
      if (!eventData.locationType) {
        return "Wajib diisi";
      }
    });

    Step1.validate("city", () => {
      if (!eventData.city?.value) {
        return "Wajib diisi";
      }
    });

    Step1.validate("registrationDateStart", () => {
      if (!eventData.registrationDateStart) {
        return "Wajib diisi";
      }
    });

    Step1.validate("registrationDateEnd", () => {
      if (!eventData.registrationDateEnd) {
        return "Wajib diisi";
      }

      if (eventData.registrationDateEnd <= eventData.registrationDateStart) {
        return "Tanggal dan jam tutup pendaftaran harus setelah waktu mulai pendaftaran";
      }
    });

    Step1.validate("eventDateStart", () => {
      if (!eventData.eventDateStart) {
        return "Wajib diisi";
      }
    });

    Step1.validate("eventDateEnd", () => {
      if (!eventData.eventDateEnd) {
        return "Wajib diisi";
      }

      if (eventData.eventDateEnd <= eventData.eventDateStart) {
        return "Tanggal dan jam akhir lomba harus setelah waktu mulai lomba";
      }
    });

    // STEP 2: Kategori
    for (const categoryGroup of eventData.eventCategories) {
      Step2.validate(`${categoryGroup.key}-competitionCategory`, () => {
        if (!categoryGroup.competitionCategory?.value) {
          return "Wajib diisi";
        }
      });

      for (const detail of categoryGroup.categoryDetails) {
        Step2.validate(`${categoryGroup.key}-${detail.key}-ageCategory`, () => {
          if (!detail.ageCategory?.value) {
            return "Wajib diisi";
          }
        });

        Step2.validate(`${categoryGroup.key}-${detail.key}-distance`, () => {
          if (!detail.distance?.value) {
            return "Wajib diisi";
          }
        });

        Step2.validate(`${categoryGroup.key}-${detail.key}-teamCategory`, () => {
          if (!detail.teamCategory?.value) {
            return "Wajib diisi";
          }
        });

        Step2.validate(`${categoryGroup.key}-${detail.key}-quota`, () => {
          if (!detail.quota) {
            return "Wajib diisi";
          }
        });
      }
    }

    step === 1 && ValidationErrors.addByGroup({ stepGroup: 1, errors: Step1.errors });
    step === 2 && ValidationErrors.addByGroup({ stepGroup: 2, errors: Step2.errors });

    setValidation((state) => ({ ...state, errors: ValidationErrors.nextErrorsState }));

    if (ValidationErrors.isNextValid()) {
      onValid?.();
    } else {
      onInvalid?.(ValidationErrors.nextErrorsState);
    }
  };

  return { isValid, errors: validationErrors, validate };
}

const ValidationErrorsByStep = (errorsState) => {
  const nextErrorsState = { ...errorsState };
  const isNextValid = () => !Object.keys(nextErrorsState)?.length;

  const addByGroup = ({ stepGroup, errors }) => {
    if (!Object.keys(errors)?.length) {
      delete nextErrorsState[stepGroup];
    } else {
      nextErrorsState[stepGroup] = errors;
    }
  };

  return { nextErrorsState, isNextValid, addByGroup };
};

const StepGroupValidation = () => {
  const validationErrors = {};
  return {
    errors: validationErrors,
    validate: (fieldName, validate) => {
      const result = validate();
      if (result) {
        validationErrors[fieldName] = [result];
      }
    },
  };
};

export default PageEventDetailManage;
