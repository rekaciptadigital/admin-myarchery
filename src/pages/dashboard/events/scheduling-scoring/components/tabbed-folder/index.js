import * as React from "react";
import { useFolderTabs } from "./hooks/folder-tabs";

import { StyledTabs, StyledButtonItem, IconWrapper, FolderPanel } from "./styles";

import classnames from "classnames";

function FolderTabs({ children }) {
  return <StyledTabs>{children}</StyledTabs>;
}

function TabItem({ children, disabled: disabledProp, icon, tab: tabProp }) {
  const { currentTab, switchToTab } = useFolderTabs();
  const tab = parseInt(tabProp);

  return (
    <div>
      <StyledButtonItem
        onClick={() => switchToTab(tab)}
        disabled={tab === currentTab || disabledProp}
        className={classnames({ "tab-disabled": disabledProp })}
      >
        {icon && tab === currentTab && <IconWrapper>{icon}</IconWrapper>}
        <span>{children}</span>
      </StyledButtonItem>
    </div>
  );
}

export { FolderTabs, TabItem, FolderPanel };
export * from "./hooks/folder-tabs";
