const SCHEDULING_TYPE = {
  INIT: "INIT_SCHEDULING",
  COMMON: "COMMON_SCHEDULES",
  SINGLE: "SINGLE_SCHEDULE",
  BULK: "BULK_SCHEDULES",
};

function schedulingReducer(state, action) {
  switch (action.type) {
    case SCHEDULING_TYPE.INIT: {
      return { ...state, status: "success", data: action.payload };
    }

    case SCHEDULING_TYPE.COMMON: {
      const { competitionCategory, payload, excludes } = action;

      const updatedCommonSchedule = { ...state.data[competitionCategory].common, ...payload };

      const previousSchedulesGroup = state.data[competitionCategory];
      const updatedSchedulesGroup = {};
      for (const detailId in previousSchedulesGroup) {
        // Abaikan kategori yang termasuk di list `excludes`
        const matchesDetailId = (id) => parseInt(id) === parseInt(detailId);
        if (excludes?.length && excludes.some(matchesDetailId)) {
          updatedSchedulesGroup[detailId] = previousSchedulesGroup[detailId];
        } else {
          updatedSchedulesGroup[detailId] = { ...updatedCommonSchedule };
        }
      }

      return {
        ...state,
        data: { ...state.data, [competitionCategory]: updatedSchedulesGroup },
      };
    }

    case SCHEDULING_TYPE.SINGLE: {
      const { competitionCategory, detailId, payload } = action;
      return {
        ...state,
        data: {
          ...state.data,
          [competitionCategory]: {
            ...state.data[competitionCategory],
            [detailId]: {
              ...state.data[competitionCategory][detailId],
              ...payload,
            },
            // reset inputan tanggal yang atas
            common: { date: "", timeStart: "", timeEnd: "" },
          },
        },
      };
    }

    case SCHEDULING_TYPE.BULK: {
      const { competitionCategory, payload } = action;
      return {
        ...state,
        data: { ...state.data, [competitionCategory]: { ...payload } },
      };
    }

    default: {
      if (action) {
        return { ...state, ...action };
      }
      return state;
    }
  }
}

export { schedulingReducer, SCHEDULING_TYPE };
