import * as React from "react";
import { useParams } from "react-router-dom";
import { useWizardView } from "utils/hooks/wizard-view";
import { schedulingReducer, SCHEDULING_TYPE } from "./hooks/qualification-scheduling-data";
import { EventsService } from "services";

import MetaTags from "react-meta-tags";
import { Container, Table } from "reactstrap";
import { WizardView, WizardViewContent, Button, ButtonOutlineBlue } from "components/ma";
import {
  StepsList,
  StepItem,
  FolderTabs,
  TabItem,
  FolderPanel,
  FieldInputDateSmall,
  FieldInputTimeSmall,
  NoticeBarInfo,
} from "./components";
import { BreadcrumbDashboard } from "../components/breadcrumb";

import IconTarget from "components/ma/icons/mono/target";
import IconScoreboard from "components/ma/icons/mono/scoreboard";
import IconBranch from "components/ma/icons/mono/branch";
import IconDiagram from "components/ma/icons/mono/diagram";
import IconCalendar from "components/ma/icons/mono/calendar";

import { parseISO } from "date-fns";

import {
  StyledPageWrapper,
  StickyContainer,
  StickyItem,
  StickyItemSibling,
  QualificationScheduleHeader,
  ScheduleGroupFormBox,
} from "./styles";

const stepsList = [
  { step: 1, label: "Atur Kualifikasi" },
  { step: 2, label: "Skor Kualifikasi" },
  { step: 3, label: "Atur Eliminasi" },
  { step: 4, label: "Skor Eliminasi" },
];

const scheduleTabs = [
  { step: 1, label: "Jadwal" },
  { step: 2, label: "Bantalan" },
];

const PageEventDetailSchedulingScoring = () => {
  const { event_id } = useParams();
  const { currentStep, goToStep } = useWizardView(stepsList);

  const [groupedCategoryDetails, setGroupedCategoryDetails] = React.useReducer(
    (state, action) => ({ ...state, ...action }),
    {
      status: "idle",
      data: null,
      errors: null,
    }
  );
  const [scheduling, dispatchScheduling] = React.useReducer(schedulingReducer, {
    status: "idle",
    data: null,
    errors: null,
  });

  const eventId = parseInt(event_id);
  const isLoadingCategoryDetails = groupedCategoryDetails.status === "loading";
  const categoryDetailsData = groupedCategoryDetails.data;
  const competitionCategories = groupedCategoryDetails.data
    ? Object.keys(groupedCategoryDetails.data)
    : [];

  const { data: schedulesData } = scheduling;
  const isLoadingSchedules = scheduling.status === "loading";

  React.useEffect(() => {
    const fetchCategoryDetails = async () => {
      setGroupedCategoryDetails({ status: "loading", errors: null });
      const result = await EventsService.getEventCategoryDetails({ event_id: eventId });
      if (result.success) {
        setGroupedCategoryDetails({ status: "success", data: result.data });
      } else {
        setGroupedCategoryDetails({ status: "error", errors: result.errors });
      }
    };

    fetchCategoryDetails();
  }, []);

  React.useEffect(() => {
    if (!categoryDetailsData) {
      return;
    }

    const fetchScheduling = async () => {
      dispatchScheduling({ status: "loading", errors: null });
      const result = await EventsService.getEventQualificationSchedules({ event_id: eventId });
      if (result.success) {
        dispatchScheduling({
          type: SCHEDULING_TYPE.INIT,
          payload: makeSchedulingData(categoryDetailsData, result.data),
        });
      } else {
        dispatchScheduling({ status: "error", errors: result.errors });
      }
    };

    fetchScheduling();
  }, [categoryDetailsData]);

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
                onChange={(step) => goToStep(step)}
              >
                <StepItem step="1" icon={<IconTarget size="20" />}>
                  Atur Kualifikasi
                </StepItem>

                <StepItem step="2" disabled icon={<IconScoreboard size="20" />}>
                  Skor Kualifikasi
                </StepItem>

                <StepItem step="3" disabled icon={<IconBranch size="20" />}>
                  Atur Eliminasi
                </StepItem>

                <StepItem step="4" disabled icon={<IconDiagram size="20" />}>
                  Skor Eliminasi
                </StepItem>
              </StepsList>
            </StickyItem>

            <StickyItemSibling>
              <WizardView currentStep={currentStep}>
                <WizardViewContent>
                  <div>
                    <FolderTabs tabs={scheduleTabs}>
                      <TabItem tab="1" icon={<IconCalendar size="16" />}>
                        Jadwal
                      </TabItem>

                      <TabItem disabled tab="2" icon={<IconCalendar size="16" />}>
                        Bantalan
                      </TabItem>
                    </FolderTabs>

                    <FolderPanel>
                      <QualificationScheduleHeader>
                        <div>
                          <h3>Jadwal Kualifikasi</h3>
                          <div>Hasil Kualifikasi Pertandingan</div>
                        </div>

                        <div>
                          <Button>Simpan</Button>
                        </div>
                      </QualificationScheduleHeader>

                      {categoryDetailsData && (
                        <NoticeBarInfo>
                          Anda tidak dapat mengatur kembali jika terdapat peserta yang telah
                          mendaftar
                        </NoticeBarInfo>
                      )}

                      {isLoadingCategoryDetails ? (
                        <div>Sedang memuat data kategori event</div>
                      ) : isLoadingSchedules ? (
                        <div>Sedang memuat data jadwal kualifikasi</div>
                      ) : competitionCategories.length && schedulesData ? (
                        competitionCategories.map((competition, index) => {
                          const scheduleGroup = schedulesData[competition];
                          const categoryDetails = categoryDetailsData[competition];
                          return (
                            <ScheduleGroupFormBox key={index}>
                              <div>
                                <div>
                                  <div
                                    className="d-flex align-items-start justify-content-between mb-4"
                                    style={{ gap: "0.5rem" }}
                                  >
                                    <div className="d-flex" style={{ gap: "0.5rem" }}>
                                      <div style={{ flexBasis: "30%" }}>
                                        <div>Kategori</div>
                                        <h4 className="mt-2">{competition}</h4>
                                      </div>

                                      <div
                                        className="d-flex"
                                        style={{ flexBasis: "70%", gap: "0.5rem" }}
                                      >
                                        <FieldInputDateSmall
                                          label="Tanggal"
                                          value={scheduleGroup.common.date}
                                          onChange={(value) =>
                                            dispatchScheduling({
                                              type: SCHEDULING_TYPE.COMMON,
                                              competitionCategory: competition,
                                              payload: { date: value },
                                            })
                                          }
                                        />
                                        <FieldInputTimeSmall
                                          label="Jam Mulai"
                                          value={scheduleGroup.common.timeStart}
                                          onChange={(value) => {
                                            dispatchScheduling({
                                              type: SCHEDULING_TYPE.COMMON,
                                              competitionCategory: competition,
                                              payload: { timeStart: value },
                                            });
                                          }}
                                        />
                                        <FieldInputTimeSmall
                                          label="Jam Selesai"
                                          value={scheduleGroup.common.timeEnd}
                                          onChange={(value) => {
                                            dispatchScheduling({
                                              type: SCHEDULING_TYPE.COMMON,
                                              competitionCategory: competition,
                                              payload: { timeEnd: value },
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div
                                      className="mt-4 d-flex justify-content-end"
                                      style={{
                                        flexBasis: "40%",
                                        textAlign: "right",
                                        gap: "0.5rem",
                                      }}
                                    >
                                      <ButtonOutlineBlue>Ubah Detail</ButtonOutlineBlue>
                                    </div>
                                  </div>

                                  <Table>
                                    <thead>
                                      <tr>
                                        <th style={{ textTransform: "uppercase" }}>Kelas</th>
                                        <th style={{ textTransform: "uppercase" }}>Jenis Regu</th>
                                        <th style={{ textTransform: "uppercase" }}>Jarak</th>
                                        <th style={{ textTransform: "uppercase" }}>Tanggal</th>
                                        <th style={{ textTransform: "uppercase" }}>
                                          Jam Kualifikasi
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {categoryDetails.map((detail) => {
                                        const {
                                          eventCategoryDetailsId: detailId,
                                          ageCategory,
                                          teamCategory,
                                          distancesCategory,
                                        } = detail;

                                        const schedule = scheduleGroup[detailId];
                                        const fieldNameDate = `schedule-date-${detailId}`;
                                        const fieldNameTimeStart = `schedule-time-start-${detailId}`;
                                        const fieldNameTimeEnd = `schedule-time-end-${detailId}`;

                                        return (
                                          <tr key={detailId}>
                                            <td>{ageCategory}</td>
                                            <td style={{ textTransform: "capitalize" }}>
                                              {teamCategory}
                                            </td>
                                            <td>{distancesCategory}</td>

                                            <td width="20%">
                                              <div>
                                                <FieldInputDateSmall
                                                  disabled={!isEditMode}
                                                  name={fieldNameDate}
                                                  value={schedule.date}
                                                />
                                              </div>
                                            </td>

                                            <td width="30%">
                                              <div className="d-flex" style={{ gap: "0.5rem" }}>
                                                <FieldInputTimeSmall
                                                  disabled={!isEditMode}
                                                  name={fieldNameTimeStart}
                                                  value={schedule.timeStart}
                                                />

                                                <FieldInputTimeSmall
                                                  disabled={!isEditMode}
                                                  name={fieldNameTimeEnd}
                                                  value={schedule.timeEnd}
                                                />
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </Table>
                                </div>
                              </div>
                            </ScheduleGroupFormBox>
                          );
                        })
                      ) : (
                        <div>Tidak ditemukan</div>
                      )}
                    </FolderPanel>
                  </div>
                </WizardViewContent>
              </WizardView>
            </StickyItemSibling>
          </StickyContainer>
        </Container>
      </StyledPageWrapper>
    </React.Fragment>
  );
};

function makeSchedulingData(groupedCategoryDetail, schedules) {
  const transformedSchedules = {};
  const makeInitialSchedule = (categoryDetailId) => {
    const emptySchedule = { date: "", timeStart: "", timeEnd: "" };

    if (!categoryDetailId) {
      return emptySchedule;
    }

    const byCategoryDetailId = (schedule) => schedule.categoryDetailId === categoryDetailId;
    const schedule = schedules.find(byCategoryDetailId);
    if (schedule) {
      return {
        date: parseISO(schedule.eventStartDatetime),
        timeStart: parseISO(schedule.eventStartDatetime),
        timeEnd: parseISO(schedule.eventEndDatetime),
      };
    }

    return emptySchedule;
  };

  for (const competitionCategory in groupedCategoryDetail) {
    transformedSchedules[competitionCategory] = {};
    for (const detail of groupedCategoryDetail[competitionCategory]) {
      transformedSchedules[competitionCategory][detail.eventCategoryDetailsId] =
        makeInitialSchedule(detail.eventCategoryDetailsId);
    }
    transformedSchedules[competitionCategory].common = makeInitialSchedule();
  }
  return transformedSchedules;
}

export default PageEventDetailSchedulingScoring;
