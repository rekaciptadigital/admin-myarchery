import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { stringUtil } from "utils";
import { useWizardView } from "utils/hooks/wizard-view";
import { eventConfigs, eventCategories } from "constants/index";
import { eventDataReducer } from "../../hooks/create-event-data";
import { EventsService } from "services";

import MetaTags from "react-meta-tags";
import { Container, Row, Col } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { Toaster } from "react-hot-toast";
import {
  StepList,
  WizardView,
  WizardViewContent,
  ButtonBlue,
  ButtonOutlineBlue,
} from "components/ma";
import {
  StepInfoUmum,
  StepBiaya,
  StepKategori,
  StepJadwal,
  StepSelesai,
  RibbonEventConfig,
} from "../../components/new-fullday";
import { PreviewPortal } from "../../components/preview";
import { LoadingScreen } from "../components/loading-screen-portal";

import IconAlertTriangle from "components/ma/icons/mono/alert-triangle";

import "pages/dashboard/events/style-overrides/main-content.scss";

// Langkah-langkah pembuatan acara
const stepsData = [
  {
    step: 1,
    label: "Informasi Umum",
    description: "Banner dan informasi mengenai event Anda",
  },
  {
    step: 2,
    label: "Biaya Registrasi",
    description: "Pengaturan biaya pendaftaran pertandingan",
  },
  {
    step: 3,
    label: "Kategori Lomba",
    description: "Pengaturan kategori beserta detailnya",
  },
  {
    step: 4,
    label: "Jadwal Pertandingan",
    description: "Atur jadwal pertandingan event Anda",
  },
  {
    step: 5,
    label: "Selesai",
  },
];

// Konstanta dan variabel terkait acara
const { EVENT_TYPES, MATCH_TYPES, PUBLICATION_TYPES } = eventConfigs;
const { TEAM_CATEGORIES } = eventCategories;

// Data awal untuk acara baru
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

// Komponen utama EventsNewFullday
const EventsNewFullday = () => {
  const navigate = useNavigate();

  // State dan fungsi terkait langkah-langkah pembuatan acara
  const {
    steps,
    currentStep,
    stepsTotal,
    currentLabel,
    goToStep,
    goToPreviousStep,
    goToNextStep,
  } = useWizardView(stepsData);

  const [lastActiveStep, setLastActiveStep] = useState(1);

  const increaseLastActiveStep = () => {
    const nextStepNumber = currentStep + 1;
    if (lastActiveStep > nextStepNumber) {
      return;
    }
    setLastActiveStep(nextStepNumber);
  };

  const [eventData, updateEventData] = useReducer(
    eventDataReducer,
    initialEventData
  );

  // State dan fungsi terkait validasi data acara
  const { errors: validationErrors } = useEventDataValidation(eventData);

  // State dan fungsi terkait penyimpanan acara
  const [savingEventStatus, setSavingEventStatus] = useState({
    status: "idle",
    errors: null,
  });
  const [shouldShowPreview, setShouldShowPreview] = useState(false);

  const isLoading = savingEventStatus.status === "loading";
  const isErrorSubmitting = savingEventStatus.status === "error";

  // Membuat payload acara untuk dikirim ke server
  const makeEventPayload = async (eventData, options) => {
    const bannerImageBase64 = eventData.bannerImage?.raw
      ? await imageToBase64(eventData.bannerImage.raw)
      : undefined;
    const handbookBase64 = eventData.handbook
      ? await imageToBase64(eventData.handbook)
      : null;

    const generatedCategories = makeEventCategories(eventData.eventCategories);
    const categoriesWithFees = makeCategoryFees(eventData, generatedCategories);

    return {
      status: options.status || PUBLICATION_TYPES.DRAFT,
      eventType: eventData.eventType,
      eventCompetition: eventData.eventCompetition,
      publicInformation: {
        eventName: eventData.eventName,
        handbook: handbookBase64,
        eventBanner: bannerImageBase64,
        eventDescription: eventData.description,
        eventLocation: eventData.location,
        eventCity: eventData.city?.value,
        eventLocation_type: eventData.locationType,
        eventStart_register: formatServerDatetime(
          eventData.registrationDateStart
        ),
        eventEnd_register: formatServerDatetime(eventData.registrationDateEnd),
        eventStart: formatServerDatetime(eventData.eventDateStart),
        eventEnd: formatServerDatetime(eventData.eventDateEnd),
      },
      more_information: eventData.extraInfos.map((info) => ({
        title: info.title,
        description: info.description,
      })),
      event_categories: categoriesWithFees,
    };
  };

  // Penanganan tombol "Simpan"
  const handleClickSaveButton = () => {
    sendFakeSubmit({
      onSuccess() {
        toast.success("Event telah disimpan");
        increaseLastActiveStep();
        goToNextStep();
      },
    });
  };

  // Penanganan penyimpanan acara
  const handleSaveEvent = async () => {
    setSavingEventStatus({ status: "loading", errors: null });

    const payload = await makeEventPayload(eventData, {
      status: PUBLICATION_TYPES.DRAFT,
    });
    const result = await EventsService.register(payload);

    if (result.success) {
      setSavingEventStatus({ status: "success", errors: null });
      const eventId = result.data?.id;
      eventId &&
        navigate(`/dashboard/events/new/prepublish?eventId=${eventId}`);
    } else {
      setSavingEventStatus({ status: "error", errors: result.errors });
    }
  };

  // Penanganan tampilan pratinjau acara
  const handlePublishEvent = async () => {
    setSavingEventStatus({ status: "loading", errors: null });

    const payload = await makeEventPayload(eventData, {
      status: PUBLICATION_TYPES.PUBLISHED,
    });
    const result = await EventsService.register(payload);

    if (result.success) {
      setSavingEventStatus({ status: "success", errors: null });
      const eventId = result.data?.id;
      eventId &&
        navigate(`/dashboard/events/new/prepublish?eventId=${eventId}`);
    } else {
      setSavingEventStatus({ status: "error", errors: result.errors });
    }
  };

  // Fungsi untuk scroll ke atas saat langkah berubah
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  return (
    <React.Fragment>
      <Toaster
        containerStyle={{ top: 80 }}
        toastOptions={{
          success: {
            style: {
              background: "var(--ma-primary-blue-50)",
            },
          },
        }}
      />

      {lastActiveStep === 1 && (
        <div>
          <RibbonEventConfig />
        </div>
      )}

      <StyledPageWrapper>
        <MetaTags>
          <title>Buat Event Baru | MyArchery.id</title>
        </MetaTags>

        <Container fluid>
          <StickyContainer>
            <StickyItem>
              <StepList
                steps={steps}
                currentStep={currentStep}
                lastActiveStep={lastActiveStep}
                onChange={(ev) => goToStep(ev.target.value)}
              >
                Pertandingan
              </StepList>
            </StickyItem>

            <StickyItemSibling>
              <RowStickyHeader>
                {currentStep < stepsTotal && (
                  <Col>
                    <h2>{currentLabel}</h2>
                    <p>{steps[currentStep - 1].description}</p>
                  </Col>
                )}
              </RowStickyHeader>

              <div className="content-scrollable flex-grow-1 mb-5">
                <div className="content-scrollable-inner">
                  <WizardView currentStep={currentStep}>
                    <WizardViewContent>
                      <StepInfoUmum
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[1] || {}}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepBiaya
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[3] || {}}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepKategori
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[2] || {}}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepJadwal
                        eventData={eventData}
                        updateEventData={updateEventData}
                        validationErrors={validationErrors[4] || {}}
                      />
                    </WizardViewContent>

                    <WizardViewContent>
                      <StepSelesai eventData={eventData} />
                    </WizardViewContent>
                  </WizardView>

                  {currentStep < stepsTotal && (
                    <div className="mx-auto d-flex justify-content-between align-items-center flex-wrap">
                      <div>
                        {currentStep > 1 && (
                          <ButtonOutlineBlue
                            corner="8"
                            onClick={() => goToPreviousStep()}
                          >
                            Sebelumnya
                          </ButtonOutlineBlue>
                        )}
                      </div>

                      <div>
                        <ButtonBlue
                          corner="8"
                          onClick={handleClickSaveButton}
                        >
                          Simpan
                        </ButtonBlue>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </StickyItemSibling>
          </StickyContainer>
        </Container>
      </StyledPageWrapper>

      <PreviewPortal
        isActive={shouldShowPreview}
        isLoading={isLoading}
        eventData={eventData}
        onClose={() => setShouldShowPreview(false)}
        onSave={handleSaveEvent}
        onPublish={handlePublishEvent}
      />

      <LoadingScreen loading={isLoading} />

      <AlertSubmitError
        isError={isErrorSubmitting}
        errors={savingEventStatus.errors}
      />
    </React.Fragment>
  );
};

// Styling untuk komponen EventsNewFullday
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

// Komponen untuk menampilkan pesan error saat submit gagal
const AlertSubmitError = ({ isError, errors, onConfirm }) => {
  const [isAlertOpen, setAlertOpen] = useState(false);

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

  useEffect(() => {
    if (isError) {
      setAlertOpen(true);
    }
  }, [isError]);

  return (
    <React.Fragment>
      <SweetAlert
        show={isAlertOpen}
        title="Gagal Menyimpan"
        type="error"
        onConfirm={handleConfirm}
        confirmBtnText="Tutup"
        confirmBtnBsStyle="primary"
        cancelBtnBsStyle="default"
        focusCancelBtn
        showCloseButton
        closeOnClickOutside
        closeOnEscape
      >
        <div>
          <IconAlertTriangle size="36" className="mr-2" />
          <span>{renderErrorMessages()}</span>
        </div>
      </SweetAlert>
    </React.Fragment>
  );
};

export default EventsNewFullday;
