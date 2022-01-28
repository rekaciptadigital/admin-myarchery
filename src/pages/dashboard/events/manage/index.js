import * as React from "react";
import styled from "styled-components";
import { useParams, useHistory } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { stringUtil } from "utils";
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
};

const PageEventDetailManage = () => {
  const history = useHistory();
  const { event_id } = useParams();
  const { steps, stepsTotal, currentStep, currentLabel, goToStep, goToPreviousStep, goToNextStep } =
    useWizardView(stepsData);
  const [eventData, updateEventData] = React.useReducer(eventDataReducer, initialEventData);
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

  const incrementAttemptCounts = () => {
    setFetchingEventStatus((state) => ({
      ...state,
      attemptCounts: state.attemptCounts + 1,
    }));
  };

  const handleClickSave = async (stepNumber) => {
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
      validateForm({
        step: stepNumber,
        onValid: () => handleSaveRegistrationFees(),
      });
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
      setSavingEventStatus((state) => ({ ...state, status: "error" }));
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
      setSavingEventStatus((state) => ({ ...state, status: "error" }));
    }
  };

  const handleSaveRegistrationFees = async () => {
    // Validate empty fields
    if (eventData.isFlatRegistrationFee && !eventData.registrationFee) {
      // TODO: ganti pakai sweet alert?
      alert("inputan harga flat masih kosong");
      return;
    }
    if (!eventData.isFlatRegistrationFee && !eventData.registrationFees?.length) {
      // TODO: ganti pakai sweet alert?
      alert("inputan harga per tim masih kosong");
      return;
    }

    setSavingEventStatus((state) => ({ ...state, status: "loading", errors: null }));
    const payload = makeFeesPayload({ event_id: eventId, ...eventData });
    const result = await EventsService.updateCategoryFee(payload);
    if (result.success) {
      setSavingEventStatus((state) => ({ ...state, status: "success" }));
      incrementAttemptCounts();
    } else {
      setSavingEventStatus((state) => ({ ...state, status: "error" }));
    }
  };

  const handleClickPublish = () => setShouldShowConfirmPublication(true);

  const handleCancelPublish = () => setShouldShowConfirmPublication(false);

  const handlePublishEvent = async () => {
    setSavingEventStatus((state) => ({ ...state, status: "loading", errors: null }));

    const result = await EventsService.setPublished({ status: 1 }, { id: eventId });
    if (result.success) {
      setSavingEventStatus((state) => ({ ...state, status: "success" }));
      eventId && history.push(`/dashboard/events/new/prepublish?eventId=${eventId}`);
    } else {
      setSavingEventStatus((state) => ({ ...state, status: "error" }));
      // TODO: popup error 422
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
        setFetchingEventStatus((state) => ({ ...state, status: "error", errors: result.errors }));
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
          <Row>
            <Col md="3">
              <StepList
                steps={steps}
                currentStep={currentStep}
                onChange={(ev) => goToStep(ev.target.value)}
              >
                Pertandingan
              </StepList>
            </Col>

            <Col lg="9" className="d-flex flex-column">
              <Row>
                <Col>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h2>{currentLabel}</h2>
                      <p>{steps[currentStep - 1].description}</p>
                    </div>

                    <div>
                      <div className="d-flex justify-content-end" style={{ gap: "0.5rem" }}>
                        <Button
                          style={{ color: "var(--ma-blue)" }}
                          onClick={() => handleClickSave(currentStep)}
                        >
                          Simpan
                        </Button>
                        {!isEventPublished && (
                          <ButtonBlue onClick={handleClickPublish}>Publikasi</ButtonBlue>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="content-scrollable flex-grow-1 mb-5">
                <div className="content-scrollable-inner">
                  <WizardView currentStep={currentStep}>
                    <WizardViewContent>
                      <StepInfoUmum
                        eventId={eventId}
                        savingStatus={savingEventStatus}
                        onSaveSuccess={() => incrementAttemptCounts()}
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[1] || {}}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepKategori
                        eventId={eventId}
                        savingStatus={savingEventStatus}
                        eventData={eventData}
                        updateEventData={updateEventData}
                        onSaveSuccess={() => incrementAttemptCounts()}
                        validationErrors={validationErrors[2] || {}}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepBiaya
                        savingStatus={savingEventStatus}
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[3] || {}}
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
            </Col>
          </Row>
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
    </React.Fragment>
  );
};

const StyledPageWrapper = styled.div`
  margin: 2.5rem 0;
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
      style={{ padding: "30px 40px" }}
      customButtons={
        <span className="d-flex justify-content-center" style={{ gap: "0.5rem", width: "100%" }}>
          <ButtonBlue onClick={onPreview} style={{ minWidth: 120 }}>
            Lihat Pratinjau
          </ButtonBlue>

          <Button onClick={onPublish} style={{ color: "var(--ma-blue)", minWidth: 120 }}>
            Publikasi
          </Button>
        </span>
      }
    >
      <p className="text-muted">Event akan dipublikasikan</p>
    </SweetAlert>
  );
}

function makeEventDetailState(initialData) {
  const { publicInformation, moreInformation, eventCategories } = initialData;

  const eventCategoriesState = makeCategoryDetailState(eventCategories);
  const feesState = makeRegistrationFeesState(eventCategories);
  const { isFlatRegistrationFee, registrationFee, registrationFees } = feesState;

  return {
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
    eventCategories: eventCategoriesState,
    isFlatRegistrationFee,
    registrationFee,
    registrationFees,
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
      })),
    };
    eventCategories.push(competitionGroup);
  }

  return eventCategories;
}

function makeRegistrationFeesState(eventCategories) {
  const registrationFees = [];
  const uniqueTeams = new Set();
  const uniqueFees = new Set();

  for (const category of eventCategories) {
    if (registrationFees.length >= 4) {
      break;
    }
    if (!category.teamCategoryId) {
      continue;
    }

    const targetTeam =
      category.teamCategoryId.id === TEAM_CATEGORIES.TEAM_INDIVIDUAL_MALE ||
      category.teamCategoryId.id === TEAM_CATEGORIES.TEAM_INDIVIDUAL_FEMALE
        ? TEAM_CATEGORIES.TEAM_INDIVIDUAL
        : category.teamCategoryId.id;

    if (!uniqueTeams.has(targetTeam)) {
      uniqueTeams.add(targetTeam);
      uniqueFees.add(Number(category.fee));
      registrationFees.push({ teamCategory: targetTeam, amount: Number(category.fee) });
    }
  }

  const isFlatRegistrationFee = uniqueFees.size === 1;
  const registrationFee = isFlatRegistrationFee ? [...uniqueFees][0] : "";

  return {
    isFlatRegistrationFee,
    registrationFee,
    registrationFees: isFlatRegistrationFee ? [] : registrationFees,
  };
}

async function makeEventDetailsPayload(eventData) {
  const bannerImageBase64 = eventData.bannerImage?.raw
    ? await imageToBase64(eventData.bannerImage.raw)
    : undefined;

  return {
    id: eventData.event_id,
    eventType: "Full_day",
    eventCompetition: "Tournament",
    status: 0, // status ketika save harus tetep `0` (draft)
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
  if (eventData.isFlatRegistrationFee) {
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
        fee: eventData.registrationFee,
      })),
    };
  }

  const feesData = [];
  for (const fee of eventData.registrationFees) {
    if (fee.teamCategory === TEAM_CATEGORIES.TEAM_INDIVIDUAL) {
      feesData.push({ team_category_id: TEAM_CATEGORIES.TEAM_INDIVIDUAL_MALE, fee: fee.amount });
      feesData.push({ team_category_id: TEAM_CATEGORIES.TEAM_INDIVIDUAL_FEMALE, fee: fee.amount });
    } else {
      feesData.push({ team_category_id: fee.teamCategory, fee: fee.amount });
    }
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
    const Step3 = StepGroupValidation();

    // STEP 1: Informasi Umum
    Step1.validate("eventName", () => {
      if (!eventData.eventName) {
        return "required";
      }
    });

    Step1.validate("location", () => {
      if (!eventData.location) {
        return "required";
      }
    });

    Step1.validate("locationType", () => {
      if (!eventData.locationType) {
        return "required";
      }
    });

    Step1.validate("city", () => {
      if (!eventData.city?.value) {
        return "required";
      }
    });

    Step1.validate("registrationDateStart", () => {
      if (!eventData.registrationDateStart) {
        return "required";
      }
    });

    Step1.validate("registrationDateEnd", () => {
      if (!eventData.registrationDateEnd) {
        return "required";
      }
    });

    Step1.validate("eventDateStart", () => {
      if (!eventData.eventDateStart) {
        return "required";
      }
    });

    Step1.validate("eventDateEnd", () => {
      if (!eventData.eventDateEnd) {
        return "required";
      }
    });

    // STEP 2: Kategori
    for (const categoryGroup of eventData.eventCategories) {
      Step2.validate(`${categoryGroup.key}-competitionCategory`, () => {
        if (!categoryGroup.competitionCategory?.value) {
          return "required";
        }
      });

      for (const detail of categoryGroup.categoryDetails) {
        Step2.validate(`${categoryGroup.key}-${detail.key}-ageCategory`, () => {
          if (!detail.ageCategory?.value) {
            return "required";
          }
        });

        Step2.validate(`${categoryGroup.key}-${detail.key}-distance`, () => {
          if (!detail.distance?.value) {
            return "required";
          }
        });

        Step2.validate(`${categoryGroup.key}-${detail.key}-teamCategory`, () => {
          if (!detail.teamCategory?.value) {
            return "required";
          }
        });

        Step2.validate(`${categoryGroup.key}-${detail.key}-quota`, () => {
          if (!detail.quota) {
            return "required";
          }
        });
      }
    }

    // STEP 3: Biaya Registrasi
    if (eventData.isFlatRegistrationFee) {
      Step3.validate("registrationFee", () => {
        if (!eventData.registrationFee) {
          return "required";
        }
      });
    } else {
      // Hanya validasikan harga tim yang dipilih di kategori.
      // Jenis tim yang tidak dipilih di kategori tidak diwajibkan diisi,
      // sehingga tidak dihitung error.
      const selectedTeamCategories = [];
      for (const categoryGroup of eventData.eventCategories) {
        for (const detail of categoryGroup.categoryDetails) {
          if (!detail.teamCategory?.value) {
            continue;
          }

          if (
            detail.teamCategory.value === TEAM_CATEGORIES.TEAM_INDIVIDUAL_MALE ||
            detail.teamCategory.value === TEAM_CATEGORIES.TEAM_INDIVIDUAL_FEMALE
          ) {
            selectedTeamCategories.push(TEAM_CATEGORIES.TEAM_INDIVIDUAL);
          } else {
            selectedTeamCategories.push(detail.teamCategory?.value);
          }
        }
      }

      for (const team of selectedTeamCategories) {
        const byTeamCategory = (fee) => fee.teamCategory === team;
        const feeData = eventData.registrationFees.find(byTeamCategory);

        Step3.validate(`registrationFee-${team}`, () => {
          if (!feeData?.amount) {
            return "required";
          }
        });
      }
    }

    step === 1 && ValidationErrors.addByGroup({ stepGroup: 1, errors: Step1.errors });
    step === 2 && ValidationErrors.addByGroup({ stepGroup: 2, errors: Step2.errors });
    step === 3 && ValidationErrors.addByGroup({ stepGroup: 3, errors: Step3.errors });

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
