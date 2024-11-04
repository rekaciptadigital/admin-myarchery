import { useFetcher } from "hooks/alt-fetcher";
import React from "react";
import { EventsService } from "services";

export const fetchClassification = (parentId, contentType, refreshData) => {
  const [parentClassificationList, setParentClassificationList] =
    React.useState(null);
  const [childrenClassificationList, setChildrenClassificationList] =
    React.useState(null);
  const getParentClassification = async () => {
    const { data } = await EventsService.getParentClassification({
      limit: 100,
    });
    setParentClassificationList(data);
  };
  const getChildrenClassification = async (parentId) => {
    if (parentId) {
      const query = { limit: 100 };
      if (parentId) {
        query.parent_Id = parentId;
        query.type = "with-parent";
      } else {
        query.type = "from-member";
      }
      const { data } = await EventsService.getChildrenClassification(query);
      const parentClassificationList = data?.data?.map((val) => ({
        value: val.title.includes("Wilayah Provinsi")
          ? "provinsi"
          : val.title.includes("Wilayah Kota")
          ? "city"
          : val.title.toLowerCase(),
        label: val.title,
        ...val,
      }));
      setChildrenClassificationList({
        ...data,
        data: parentClassificationList,
      });
    } else {
      setChildrenClassificationList([]);
    }
  };
  React.useEffect(() => {
    if (contentType === "list" || refreshData) {
      getParentClassification();
    }
    if (typeof parentId === "number") {
      getChildrenClassification(parentId);
    }
  }, [parentId, contentType, refreshData]);

  return { parentClassificationList, childrenClassificationList };
};

const initialState = {
  is_active_classification: false,
  classification: [
    {
      label: "Buat/Edit Klasifikasi",
      value: "newClassification",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="red"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 4.16797V15.8346"
            stroke="#757575"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.16797 10H15.8346"
            stroke="#757575"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ],
  newClassification: {},
  currentView: 1,
  parentClassification: [],
};

const useClassification = () => {
  const [state, dispatch] = React.useReducer(
    classificationAction,
    initialState
  );

  const setClassification = (value) => {
    dispatch({ type: "ADD_CLASSIFICATION_CATEGORY", payload: value });
  };

  const setNewClassification = (value) => {
    dispatch({ type: "ADD_NEW_CLASSIFICATION_CATEGORY", payload: value });
  };

  const setParentClassification = (value) => {
    dispatch({ type: "ADD_PARENT_CLASSIFICATION_CATEGORY", payload: value });
  };

  const setChangeView = (value) => {
    dispatch({ type: "CHANGE_VIEW", payload: value });
  };

  return {
    ...state,
    setClassification,
    setChangeView,
    setNewClassification,
    setParentClassification,
  };
};

const classificationAction = (state, action) => {
  switch (action.type) {
    case "ADD_CLASSIFICATION_CATEGORY":
      if (action.payload?.length > 1) {
        const checkClassificationAdded = state.classification.slice(
          0,
          state.classification.length - 1
        );
        if (
          !checkClassificationAdded?.length ||
          checkClassificationAdded.every((el, index) => {
            return el.value === action.payload[index]?.value;
          })
        ) {
          const fistCategories = [...action.payload, ...state.classification];
          return { ...state, classification: fistCategories };
        } else {
          return { ...state };
        }
      } else {
        const categories = [...state.classification];
        const newCategories = categories.filter(
          (classification) => classification?.value === action.payload?.value
        );
        if (!newCategories.length) {
          categories.splice(
            state.classification?.length - 1,
            0,
            action.payload
          );
        }
        return { ...state, classification: categories };
      }
    case "CHANGE_VIEW":
      return { ...state, currentView: action.payload };
    case "ADD_NEW_CLASSIFICATION_CATEGORY":
      return { ...state, newClassification: action.payload };
    case "ADD_PARENT_CLASSIFICATION_CATEGORY":
      return { ...state, parentClassification: action.payload };
  }
};

const useClassificationFormData = () => {
  const fetcherCreate = useFetcher();
  const fetcherUpdate = useFetcher();
  const fetcherDelete = useFetcher();
  const submit = (payload, options) => {
    const postFuction = () => {
      return EventsService.createParentClassification(payload);
    };
    fetcherCreate.runAsync(postFuction, options);
  };
  const submitUpdate = (payload, options, parentId) => {
    const updateFunction = () =>
      EventsService.updateParentClassification(payload, parentId);
    fetcherUpdate.runAsync(updateFunction, options);
  };
  const submitDelete = (options, parentId) => {
    const deleteFunction = () =>
      EventsService.deleteParentClassification({ id: parentId });
    fetcherDelete.runAsync(deleteFunction, options);
  };

  return {
    createNew: { ...fetcherCreate, submit },
    updateParent: { ...fetcherUpdate, submitUpdate },
    deleteParent: { ...fetcherDelete, submitDelete },
  };
};

export function useFetchClassification() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    // Effect logic here
  }, []);

  return { data, loading };
}

// Use custom hook in component
function Component() {
  const classification = useFetchClassification();
  // ...
}

export { useClassification, useClassificationFormData };
