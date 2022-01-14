import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import styled from "styled-components";
import queryString from "query-string";
import classnames from "classnames";
import { useWizardView } from "utils/hooks/wizard-view";
import { EventsService } from "services";

import MetaTags from "react-meta-tags";
import { Container, Row, Col } from "reactstrap";
import { WizardView, WizardViewContent, Button, ButtonBlue } from "components/ma";
import PanelJadwalKualifikasi from "../components/pre-publish/PanelJadwalKualifikasi";

import imageIllustrationSaveSuccess from "assets/images/events/create-event-save-success.png";
import imageIllustrationEventReady from "assets/images/events/create-event-event-ready.png";

const stepsList = [
  {
    step: 1,
    label: "Atur Pertandingan",
    description: "Selamat! Event pertandingan berhasil dipublikasi. Segera atur jadwal kualifikasi",
  },
  {
    step: 2,
    label: "Jadwal Kualifikasi",
    description:
      "Peserta dapat mendaftar pertandingan jika Anda telah mengatur jadwal kualifikasi.",
  },
  {
    step: 3,
    label: "Event Siap",
    description: "Selamat! Event Anda sudah terpublikasi dan peserta dapat mendaftar.",
  },
];

function PagePrePublish() {
  const location = useLocation();
  const { steps, currentStep, goToStep } = useWizardView(stepsList);
  const [eventDetail, setEventDetail] = React.useState({
    status: "idle",
    data: null,
    errors: null,
  });

  const { eventId } = queryString.parse(location.search);
  const eventDetailData = eventDetail.data;
  const isLoadingEvent = eventDetail.status === "loading";

  const handlePublishSuccess = () => goToStep(3); // screen "sudah siap"

  React.useEffect(() => {
    const fetchEvent = async () => {
      setEventDetail((state) => ({ ...state, status: "loading" }));
      const result = await EventsService.getEventDetailById({ id: eventId });
      if (result.success) {
        setEventDetail((state) => ({ ...state, status: "success", data: result.data }));
      } else {
        setEventDetail((state) => ({ ...state, status: "error", errors: result.errors }));
      }
    };

    fetchEvent();
  }, []);

  React.useEffect(() => {
    if (!eventDetailData) {
      return;
    }

    // TODO: cek apakah nama properti di data API ini `scheduleStatus` atau lain
    const { eventStatus, scheduleStatus } = eventDetailData.publicInformation;
    if (eventStatus === 1 && scheduleStatus === 1) {
      goToStep(3); // konfirmasi sudah siap
    } else if (eventStatus === 1) {
      goToStep(2); // set jadwal kualifikasi
    } else {
      goToStep(1); // konfirmasi draft
    }
  }, [eventDetailData]);

  return (
    <div className="page-content">
      <MetaTags>
        <title>Atur pertandingan | MyArchery.id</title>
      </MetaTags>

      <Container fluid className="my-5">
        {!eventId ? (
          <div className="d-flex justify-content-center align-items-center">
            <div className="text-center">
              <h4>Event tidak valid</h4>
              <div>
                <Button as={Link} to="/dashboard">
                  Kembali ke Dashboard EO
                </Button>
              </div>
            </div>
          </div>
        ) : isLoadingEvent ? (
          <div>Sedang memuat data event...</div>
        ) : eventDetailData ? (
          <Row>
            <Col md="4">
              <CardFlatBasic>
                <h2 className="mt-2 mb-4">Sedikit Lagi</h2>
                <div>
                  {steps.map((step) => (
                    <StepItem
                      key={step.step}
                      className={classnames({ "step-remaining": step.step > currentStep })}
                    >
                      <StepNumbering
                        className={classnames({ "step-active": step.step === currentStep })}
                      >
                        <StepNumber>&#10003;</StepNumber>
                      </StepNumbering>
                      <StepContent>
                        <h5 className="step-heading">{step.label}</h5>
                        <div className="step-description">{step.description}</div>
                      </StepContent>
                    </StepItem>
                  ))}
                </div>
              </CardFlatBasic>
            </Col>

            <Col md="8">
              <WizardView currentStep={currentStep}>
                <WizardViewContent>
                  <div>
                    <IllustrationSaveSuccess />
                    <PanelContent>
                      <h2>Pengaturan Pertandingan berhasil disimpan</h2>
                      <div>
                        Atur pertandingan, jadwal kualifikasi &amp; semua tentang event di Manage
                        Event. Buat lebih banyak event di Dashboard EO.
                      </div>
                      <div className="action-buttons">
                        <ButtonToDashboardEO />
                        <ButtonToManageEvent eventId={eventId} />
                      </div>
                    </PanelContent>
                  </div>
                </WizardViewContent>

                <WizardViewContent>
                  <PanelJadwalKualifikasi
                    eventId={eventId}
                    eventData={eventDetailData}
                    onPublishSuccess={handlePublishSuccess}
                  />
                </WizardViewContent>

                <WizardViewContent>
                  <div>
                    <IllustrationEventReady />
                    <PanelContent>
                      <h2>{eventDetailData.publicInformation.eventName} sudah siap!</h2>
                      <div>
                        Atur pertandingan, jadwal kualifikasi &amp; semua tentang event di Manage
                        Event. Buat lebih banyak event di Dashboard EO.
                      </div>
                      <div className="action-buttons">
                        <ButtonToDashboardEO />
                        <ButtonToManageEvent eventId={eventId} />
                      </div>
                    </PanelContent>
                  </div>
                </WizardViewContent>
              </WizardView>
            </Col>
          </Row>
        ) : (
          <div>Gagal memuat data event.</div>
        )}
      </Container>
    </div>
  );
}

const CardFlatBasic = styled.div`
  margin-bottom: 2rem;
  padding: 24px;
  border-radius: 8px;
  background-color: #ffffff;
`;

const StepItem = styled.div`
  display: flex;

  &:last-of-type > *:first-child {
    border-right: solid 1px transparent;
  }
`;

const StepNumbering = styled.div`
  position: relative;
  flex: 0 0 0.5rem;
  box-sizing: content-box;
  border-right: solid 1px var(--ma-blue-100);

  &.step-active > span {
    transform: scale(1.4);
  }
`;

const StepNumber = styled.span`
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  width: 1rem;
  height: 1rem;
  border-radius: 50%;

  background-color: var(--ma-blue);
  color: #ffffff;

  ${StepItem}.step-remaining & {
    background-color: var(--ma-blue-100);
  }
`;

const StepContent = styled.div`
  padding-left: 1.5rem;
  padding-bottom: 2rem;

  .step-heading {
    color: var(--ma-blue);

    ${StepItem}.step-remaining & {
      color: var(--ma-blue-100);
    }
  }

  .step-description {
    color: var(--ma-gray-600);

    ${StepItem}.step-remaining & {
      color: var(--ma-gray-400);
    }
  }
`;

const PanelContent = styled.div`
  text-align: center;

  .action-buttons {
    margin-top: 2.5rem;
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }
`;

const IllustrationSaveSuccess = styled.div`
  margin-bottom: 72px;
  width: 100%;
  min-height: 247px;
  background-image: url(${imageIllustrationSaveSuccess});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
`;

const IllustrationEventReady = styled.div`
  margin-bottom: 72px;
  width: 100%;
  min-height: 328px;
  background-image: url(${imageIllustrationEventReady});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
`;

function ButtonToDashboardEO() {
  return (
    <Button style={{ color: "var(--ma-blue)" }} as={Link} to="/dashboard">
      Dashboard EO
    </Button>
  );
}

function ButtonToManageEvent({ eventId }) {
  return (
    <ButtonBlue as={Link} to={`/dashboard/event/${eventId}/home`}>
      Manage Event
    </ButtonBlue>
  );
}

export default PagePrePublish;