import * as React from "react";
import { schedulingReducer, SCHEDULING_TYPE } from "./hooks/qualification-scheduling-data";
import { EventsService } from "services";

import { Table } from "reactstrap";
import { LoadingScreen } from "components";
import { Button, ButtonOutlineBlue } from "components/ma";
import {
  FolderPanel,
  FieldInputDateSmall,
  FieldInputTimeSmall,
  NoticeBarInfo,
  BottomFlashMessage,
} from "../../components";

import classnames from "classnames";
import { parseISO, format } from "date-fns";

import { QualificationScheduleHeader, ScheduleGroupFormBox, SchedulingFormActions } from "./styles";

function TabScheduling({ eventId }) {
  const [categoryDetailsData, dispatchCategoryDetailsData] = React.useReducer(
    categoryDetailsReducer,
    {
      status: "idle",
      data: null,
      errors: null,
      attempts: 0,
    }
  );

  const { data: categoryDetails, attempts } = categoryDetailsData;
  const isLoadingCategoryDetails = categoryDetailsData.status === "loading";
  const categoryGroupNames = categoryDetailsData.data ? Object.keys(categoryDetailsData.data) : [];

  const [editMode, dispatchEditMode] = React.useReducer(
    (state, action) => ({ ...state, ...action }),
    {
      currentId: null,
      status: "closed",
      initialSchedules: null,
      flashMessage: "",
    }
  );

  const isEditMode = editMode.status === "open";

  const [schedulingData, dispatchScheduling] = React.useReducer(schedulingReducer, {
    status: "idle",
    data: null,
    errors: null,
  });

  const isLoadingSchedules = schedulingData.status === "loading";

  const [schedulingForm, dispatchShedulingForm] = React.useReducer(
    (state, action) => ({ ...state, ...action }),
    { isDirty: false, isFirstInit: true, errors: {}, warnings: {} }
  );

  const { isFirstInit: isFormFirstInit, errors: validationErrors } = schedulingForm;

  const [submitStatus, dispatchSubmitStatus] = React.useReducer(
    (state, action) => ({ ...state, ...action }),
    { status: "idle", errors: null }
  );

  const isLoadingSubmit = submitStatus.status === "loading";

  const handleClickSaveSchedule = async () => {
    if (isEditMode) {
      displayFlashMessage("Simpan terlebih dahulu jadwal yang diubah di bawah");
      return;
    }

    dispatchShedulingForm({ isFirstInit: false });
    const { isValid } = runValidation();
    if (!isValid) {
      displayFlashMessage("Tanggal, jam mulai dan jam selesai lomba harus lengkap");
      return;
    }

    dispatchSubmitStatus({ status: "loading", errors: null });
    const payload = makeSchedulesPayload(schedulesData);
    const result = await EventsService.storeQualificationSchedules(payload);
    if (result.success) {
      dispatchSubmitStatus({ status: "success" });
      dispatchCategoryDetailsData({ type: "REFETCH" });
    } else {
      dispatchSubmitStatus({ status: "error", errors: result.errors });
    }
  };

  function displayFlashMessage(message) {
    dispatchEditMode({ flashMessage: message });
    setTimeout(() => {
      dispatchEditMode({ flashMessage: "" });
    }, 3000);
  }

  const { data: schedulesData } = schedulingData;

  React.useEffect(() => {
    const fetchCategoryDetails = async () => {
      dispatchCategoryDetailsData({ status: "loading", errors: null });
      const result = await EventsService.getEventCategoryDetails({ event_id: eventId });
      if (result.success) {
        dispatchCategoryDetailsData({ status: "success", data: result.data });
      } else {
        dispatchCategoryDetailsData({ status: "error", errors: result.errors });
      }
    };

    fetchCategoryDetails();
  }, [attempts]);

  React.useEffect(() => {
    if (!categoryDetails) {
      return;
    }

    const fetchScheduling = async () => {
      dispatchScheduling({ status: "loading", errors: null });
      const result = await EventsService.getEventQualificationSchedules({ event_id: eventId });
      if (result.success) {
        dispatchScheduling({
          type: SCHEDULING_TYPE.INIT,
          payload: makeSchedulingData(categoryDetails, result.data),
        });
      } else {
        dispatchScheduling({ status: "error", errors: result.errors });
      }
    };

    fetchScheduling();
  }, [categoryDetails]);

  const runValidation = () => {
    const validationErrors = {};
    const validationWarnings = {};
    for (const competitionGroup in schedulesData) {
      const schedules = schedulesData[competitionGroup];
      for (const scheduleId in schedules) {
        if (scheduleId === "common") {
          continue;
        }

        // Hanya validasikan kalau inputnya gak lengkap
        // Kalau kosong semua malah gak papa, bisa diabaikan
        const schedule = schedules[scheduleId];
        if (!schedule.date && !schedule.timeStart && !schedule.timeEnd) {
          validationWarnings[`schedule-date-${scheduleId}`] = [
            "Isi agar pendaftaran dapat dibuka.",
          ];
          validationWarnings[`schedule-time-start-${scheduleId}`] = [
            "Isi agar pendaftaran dapat dibuka.",
          ];
          validationWarnings[`schedule-time-end-${scheduleId}`] = [
            "Isi agar pendaftaran dapat dibuka.",
          ];
          continue;
        }

        if (!schedule.date) {
          validationErrors[`schedule-date-${scheduleId}`] = ["required"];
        }
        if (!schedule.timeStart) {
          validationErrors[`schedule-time-start-${scheduleId}`] = ["required"];
        }
        if (!schedule.timeEnd) {
          validationErrors[`schedule-time-end-${scheduleId}`] = ["required"];
        }
      }
    }
    dispatchShedulingForm({ errors: validationErrors, warnings: validationWarnings });
    const isValid = !Object.keys(validationErrors)?.length;
    return { validationErrors, validationWarnings, isValid };
  };

  React.useEffect(() => {
    if (isFormFirstInit) {
      return;
    }
    runValidation();
  }, [isFormFirstInit, schedulesData]);

  return (
    <React.Fragment>
      <FolderPanel>
        <QualificationScheduleHeader>
          <div>
            <h3>Jadwal Kualifikasi</h3>
            <div>Pengaturan jadwal tiap kategori</div>
          </div>

          <SchedulingFormActions>
            <Button onClick={handleClickSaveSchedule}>Simpan</Button>
            {editMode.flashMessage && (
              <BottomFlashMessage>{editMode.flashMessage}</BottomFlashMessage>
            )}
          </SchedulingFormActions>
        </QualificationScheduleHeader>

        {categoryDetails && (
          <NoticeBarInfo>
            Anda tidak dapat mengatur kembali jika terdapat peserta yang telah mendaftar
          </NoticeBarInfo>
        )}
      </FolderPanel>

      <FolderPanel style={{ paddingTop: 3 }}>
        {isLoadingCategoryDetails && !attempts ? (
          <div>Sedang memuat data kategori event</div>
        ) : isLoadingSchedules && !attempts ? (
          <div>Sedang memuat data jadwal kualifikasi</div>
        ) : categoryGroupNames.length && schedulesData ? (
          categoryGroupNames.map((groupName, index) => {
            const scheduleGroup = schedulesData[groupName];
            const categoryDetailsByName = categoryDetails[groupName];
            const shouldAllowEditMode = isEditMode && editMode.currentId === groupName;

            const handleCommonChange = (payload) => {
              const byHavingParticipants = (detail) => detail.totalParticipant > 0;
              const categoryDetailId = (detail) => detail.eventCategoryDetailsId;

              const categoryDetailWithParticipantsIds = categoryDetailsByName
                .filter(byHavingParticipants)
                .map(categoryDetailId);

              dispatchScheduling({
                type: SCHEDULING_TYPE.COMMON,
                competitionCategory: groupName,
                payload: payload,
                excludes: categoryDetailWithParticipantsIds,
              });
            };

            const handleOpenEditSchedule = () => {
              if (isEditMode) {
                return;
              }

              const currentSchedules = { ...scheduleGroup };
              dispatchEditMode({
                currentId: groupName,
                status: "open",
                initialSchedules: currentSchedules,
              });
            };

            const handleCloseEditSchedule = () => {
              dispatchEditMode({
                currentId: null,
                status: "closed",
                initialSchedules: null,
                flashMessage: "",
              });
            };

            const handleCancelEditSchedule = (payload) => {
              dispatchScheduling({
                type: SCHEDULING_TYPE.BULK,
                competitionCategory: groupName,
                payload,
              });
              handleCloseEditSchedule();
            };

            return (
              <ScheduleGroupFormBox
                key={index}
                className={classnames({ "is-focused": shouldAllowEditMode })}
              >
                <div>
                  <div>
                    <div
                      className="d-flex align-items-start justify-content-between mb-4"
                      style={{ gap: "0.5rem" }}
                    >
                      <div className="d-flex" style={{ gap: "0.5rem" }}>
                        <div style={{ flexBasis: "30%" }}>
                          <div>Kategori</div>
                          <h4 className="mt-2">{groupName}</h4>
                        </div>

                        <div className="d-flex" style={{ flexBasis: "70%", gap: "0.5rem" }}>
                          <FieldInputDateSmall
                            label="Tanggal"
                            disabled={shouldAllowEditMode}
                            value={scheduleGroup.common.date}
                            onChange={(value) => {
                              handleCommonChange({ date: value });
                            }}
                          />
                          <FieldInputTimeSmall
                            label="Jam Mulai"
                            disabled={shouldAllowEditMode}
                            value={scheduleGroup.common.timeStart}
                            onChange={(value) => {
                              handleCommonChange({ timeStart: value });
                            }}
                          />
                          <FieldInputTimeSmall
                            label="Jam Selesai"
                            disabled={shouldAllowEditMode}
                            value={scheduleGroup.common.timeEnd}
                            onChange={(value) => {
                              handleCommonChange({ timeEnd: value });
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
                        {shouldAllowEditMode ? (
                          <React.Fragment>
                            <Button
                              onClick={() => handleCancelEditSchedule(editMode.initialSchedules)}
                            >
                              Batal
                            </Button>
                            <ButtonOutlineBlue onClick={handleCloseEditSchedule}>
                              Simpan
                            </ButtonOutlineBlue>
                          </React.Fragment>
                        ) : (
                          <ButtonOutlineBlue onClick={handleOpenEditSchedule}>
                            Ubah Detail
                          </ButtonOutlineBlue>
                        )}
                      </div>
                    </div>

                    <Table>
                      <thead>
                        <tr>
                          <th style={{ textTransform: "uppercase" }}>Kelas</th>
                          <th style={{ textTransform: "uppercase" }}>Jenis Regu</th>
                          <th style={{ textTransform: "uppercase" }}>Jarak</th>
                          <th style={{ textTransform: "uppercase" }}>Tanggal</th>
                          <th style={{ textTransform: "uppercase" }}>Jam Kualifikasi</th>
                          <th style={{ textTransform: "uppercase" }}>Peserta</th>
                        </tr>
                      </thead>

                      <tbody>
                        {categoryDetailsByName.map((detail) => {
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

                          const totalParticipant = detail.totalParticipant || 0;

                          const isInputAllowed = shouldAllowEditMode && totalParticipant <= 0;

                          const handleSingleScheduleChange = (payload) => {
                            dispatchScheduling({
                              type: SCHEDULING_TYPE.SINGLE,
                              competitionCategory: groupName,
                              detailId,
                              payload,
                            });
                          };

                          return (
                            <tr key={detailId}>
                              <td>{ageCategory}</td>
                              <td style={{ textTransform: "capitalize" }}>{teamCategory}</td>
                              <td>{distancesCategory}</td>

                              <td width="20%">
                                <div>
                                  <FieldInputDateSmall
                                    disabled={!isInputAllowed}
                                    name={fieldNameDate}
                                    value={schedule.date}
                                    onChange={(value) => {
                                      handleSingleScheduleChange({
                                        competitionCategory: groupName,
                                        detailId,
                                        date: value,
                                      });
                                    }}
                                    errors={validationErrors[fieldNameDate]}
                                  />
                                </div>
                              </td>

                              <td width="30%">
                                <div className="d-flex" style={{ gap: "0.5rem" }}>
                                  <FieldInputTimeSmall
                                    disabled={!isInputAllowed}
                                    name={fieldNameTimeStart}
                                    value={schedule.timeStart}
                                    onChange={(value) => {
                                      handleSingleScheduleChange({
                                        competitionCategory: groupName,
                                        detailId,
                                        timeStart: value,
                                      });
                                    }}
                                    errors={validationErrors[fieldNameTimeStart]}
                                  />

                                  <FieldInputTimeSmall
                                    disabled={!isInputAllowed}
                                    name={fieldNameTimeEnd}
                                    value={schedule.timeEnd}
                                    onChange={(value) => {
                                      handleSingleScheduleChange({
                                        competitionCategory: groupName,
                                        detailId,
                                        timeEnd: value,
                                      });
                                    }}
                                    errors={validationErrors[fieldNameTimeEnd]}
                                  />
                                </div>
                              </td>

                              {totalParticipant ? (
                                <td>{totalParticipant} orang</td>
                              ) : (
                                <td>&mdash;</td>
                              )}
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

      <LoadingScreen loading={isLoadingSubmit} />
    </React.Fragment>
  );
}

function categoryDetailsReducer(state, action) {
  if (action.type === "REFETCH") {
    return { ...state, attempts: state.attempts + 1 };
  }
  return { ...state, ...action };
}

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

function makeSchedulesPayload(schedules) {
  const qualificationTime = [];
  for (const competitionCategory in schedules) {
    const scheduleGroup = schedules[competitionCategory];
    for (const detailId in scheduleGroup) {
      if (detailId === "common") {
        continue;
      }

      const schedule = scheduleGroup[detailId];
      if (!schedule.date || !schedule.timeStart || !schedule.timeEnd) {
        continue;
      }

      const schedulePayloadItem = {
        category_detail_id: detailId,
        event_start_datetime: formatServerDatetime(schedule.date, schedule.timeStart),
        event_end_datetime: formatServerDatetime(schedule.date, schedule.timeEnd),
      };
      qualificationTime.push(schedulePayloadItem);
    }
  }
  return { qualificationTime };
}

function formatServerDatetime(date, time) {
  const dateString = format(date, "yyyy-MM-dd");
  const timeString = format(time, "HH:mm:ss");
  return `${dateString} ${timeString}`;
}

export { TabScheduling };
