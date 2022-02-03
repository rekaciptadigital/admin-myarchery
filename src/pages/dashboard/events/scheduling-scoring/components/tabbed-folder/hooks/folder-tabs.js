import * as React from "react";

const TabsContext = React.createContext();

function useFolderTabs() {
  return React.useContext(TabsContext);
}

export { TabsContext, useFolderTabs };
