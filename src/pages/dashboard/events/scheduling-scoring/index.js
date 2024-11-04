import * as React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import { useWizardView } from "utils/hooks/wizard-view";

import MetaTags from "react-meta-tags";
import { Container } from "reactstrap";
import { WizardView, WizardViewContent } from "components/ma";
import { StepsList, StepItem } from "./components";
import { BreadcrumbDashboard } from "../components/breadcrumb";
import { StepManageQualification, StepScoringQualification, StepManageElimination } from "./views";

import IconTarget from "components/ma/icons/mono/target";
import IconScoreboard from "components/ma/icons/mono/scoreboard";
import IconBranch from "components/ma/icons/mono/branch";

import { StyledPageWrapper, StickyContainer, StickyItem, StickyItemSibling } from "./styles";

const stepsList = [
  { step: 1, label: "Atur Kualifikasi" },
  { step: 2, label: "Skor Kualifikasi" },
  { step: 3, label: "Atur Eliminasi" },
  { step: 4, label: "Skor Eliminasi" },
];

const PageEventDetailSchedulingScoring = () => {
  const { event_id } = useParams();
  const history = useNavigate();
  const location = useLocation();

  const eventId = parseInt(event_id);
  const { menu } = queryString.parse(location.search);
  const paramMenu = menu ? parseInt(menu) : undefined;

  const { currentStep, goToStep } = useWizardView(stepsList, paramMenu);

  return (
    <React.Fragment>
      <MetaTags>
        <title>Atur Jadwal dan Skor Pertandingan | MyArchery.id</title>
      </MetaTags>

      <StyledPageWrapper>
        <Container fluid>
          <BreadcrumbDashboard to={`/dashboard/event/${eventId}/home`}>Kembali</BreadcrumbDashboard>

          <StickyContainer>
            <StickyItem>
              <StepsList
                title="Jadwal &amp; Scoring"
                currentStep={currentStep}
                onChange={(step) => {
                  goToStep(step);
                  history.replace(`${location.pathname}?menu=${step}`);
                }}
              >
                <StepItem step="1" icon={<IconTarget size="20" />}>
                  Atur Kualifikasi
                </StepItem>

                <StepItem step="2" icon={<IconScoreboard size="20" />}>
                  Skor Kualifikasi
                </StepItem>

                <StepItem step="3" icon={<IconBranch size="20" />}>
                  Skor Eliminasi
                </StepItem>
              </StepsList>
            </StickyItem>

            <StickyItemSibling>
              <WizardView currentStep={currentStep}>
                <WizardViewContent>
                  <StepManageQualification eventId={eventId} />
                </WizardViewContent>

                <WizardViewContent>
                  <StepScoringQualification />
                </WizardViewContent>

                <WizardViewContent>
                  <StepManageElimination />
                </WizardViewContent>
              </WizardView>
            </StickyItemSibling>
          </StickyContainer>
        </Container>
      </StyledPageWrapper>
    </React.Fragment>
  );
};

export default PageEventDetailSchedulingScoring;
