import * as React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import classnames from "classnames";
import { EventsService } from "services";
import { prepareResponseDataAsPayload } from "./utils";

import MetaTags from "react-meta-tags";
import {
  Container,
  Row,
  Col,
  ListGroup as BSListGroup,
  ListGroupItem as BSListGroupItem,
  Button as BSButton,
} from "reactstrap";
import { LoadingScreen } from "components";
import { ButtonBiru, ButtonMerah } from "./components/buttons";

import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";

const stepsData = [
  {
    stepNumber: 1,
    title: "Informasi Umum",
    description: "Banner dan Informasi mengenai event Anda",
  },
  {
    stepNumber: 2,
    title: "Biaya Registrasi",
    description: "Banner dan Informasi mengenai event Anda",
  },
  {
    stepNumber: 3,
    title: "Jadwal Pertandingan",
    description: "Banner dan Informasi mengenai event Anda",
  },
  {
    stepNumber: 4,
    title: "Kategori Lomba",
    description: "Banner dan Informasi mengenai event Anda",
  },
];

const StepList = styled(BSListGroup)`
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: #0d47a1;
  border-radius: 8px;
`;

const StepListItem = styled(BSListGroupItem)`
  display: flex;
  align-items: center;
  padding-left: 30px;
  padding-right: 40px;
  border: none;
  background-color: #0d47a1;
  color: #ffffff;

  a&:hover {
    color: #ffffff;
    background-color: rgba(212, 226, 252, 0.08);
  }

  a&.active-step {
    background-color: rgba(212, 226, 252, 0.25);
  }
`;

const StepListHeading = styled.span`
  display: inline-block;
  text-transform: uppercase;
  font-weight: 600;
`;

const StepNumberBullet = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1em;
  width: 2em;
  height: 2em;
  border-radius: 1em;
  background-color: #ffffff;
  color: #0d47a1;
`;

export default function EventDetailPertandingan() {
  const [fetchLoading, setFetchLoading] = React.useState(false);

  const { event_id } = useParams();
  const [eventDetail, setEventDetail] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(1);

  const gotoPrevStep = () => {
    setCurrentStep((current) => {
      return current <= 1 ? current : current - 1;
    });
  };

  const gotoNextStep = () => {
    setCurrentStep((current) => {
      return current >= stepsData.length ? current : current + 1;
    });
  };

  React.useEffect(() => {
    const getEventDetail = async () => {
      setFetchLoading(true);
      const { data } = await EventsService.getEventById({ id: event_id });
      if (data) {
        const eventData = prepareResponseDataAsPayload(data);
        setEventDetail(eventData);
      }
      setFetchLoading(false);
    };
    getEventDetail();
  }, []);

  const handleClickSimpan = () => {
    alert("simpan!");
  };

  const handleClickPreview = () => {
    alert("Preview!");
  };

  const handleClickPublish = () => {
    alert("Publish!");
  };

  return (
    <div className="page-content">
      <MetaTags>
        <title>Manage Pertandingan{eventDetail && ` | ${eventDetail.eventName}`}</title>
      </MetaTags>

      <Container fluid>
        {fetchLoading ? (
          <div>Mempersiapkan data...</div>
        ) : (
          <React.Fragment>
            <Row className="event-editor">
              <Col lg="3">
                <StepList>
                  <StepListItem>
                    <StepListHeading className="text-white">Pertandingan</StepListHeading>
                  </StepListItem>

                  {stepsData.map((step) => (
                    <StepListItem
                      key={step.stepNumber}
                      tag="a"
                      className={classnames({ "active-step": currentStep === step.stepNumber })}
                      onClick={() => setCurrentStep(step.stepNumber)}
                    >
                      <StepNumberBullet>{step.stepNumber}</StepNumberBullet> {step.title}
                    </StepListItem>
                  ))}
                </StepList>
              </Col>

              <Col lg="9" className="d-flex flex-column">
                <Row>
                  <Col>
                    <h2>{stepsData.find((step) => step.stepNumber === currentStep).title}</h2>
                    <p>{stepsData.find((step) => step.stepNumber === currentStep).description}</p>
                  </Col>

                  <Col lg="auto">
                    <BSButton className="me-2 px-4" color="light" onClick={handleClickSimpan}>
                      Simpan
                    </BSButton>

                    <ButtonBiru className="me-2 px-4" onClick={handleClickPreview}>
                      Preview
                    </ButtonBiru>

                    <ButtonMerah className="px-4" onClick={handleClickPublish}>
                      Publish
                    </ButtonMerah>
                  </Col>
                </Row>

                <div className="content-scrollable flex-grow-1">
                  <div className="content-scrollable-inner">
                    {currentStep === 1 && <Step1 eventDetail={eventDetail} />}
                    {currentStep === 2 && <Step2 eventDetail={eventDetail} />}
                    {currentStep === 3 && <Step3 eventDetail={eventDetail} />}
                    {currentStep === 4 && <Step4 eventDetail={eventDetail} />}

                    <div
                      className="mx-auto d-flex justify-content-around align-items-center flex-wrap"
                      style={{ color: "#0D47A1", maxWidth: "300px" }}
                    >
                      {currentStep > 1 && (
                        <a onClick={() => gotoPrevStep()}>
                          <i className="mdi mdi-chevron-up" />
                          <span className="ms-1">
                            {stepsData.find((step) => step.stepNumber === currentStep - 1).title}
                          </span>
                        </a>
                      )}
                      {currentStep < stepsData.length && (
                        <a onClick={() => gotoNextStep()}>
                          <i className="mdi mdi-chevron-down" />
                          <span className="ms-1">
                            {stepsData.find((step) => step.stepNumber === currentStep + 1).title}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </React.Fragment>
        )}
      </Container>

      <LoadingScreen loading={fetchLoading} />
    </div>
  );
}
