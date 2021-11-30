import * as React from "react";
import styled from "styled-components";
import classnames from "classnames";

const StyledCardTabList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;

  li:not(:first-child) {
    margin-left: 10px;
  }
`;

function TabList({ children }) {
  return <StyledCardTabList>{children}</StyledCardTabList>;
}

const computeDisabledStyling = (styledObj) => {
  return ({ disabled }) => (disabled ? styledObj.disabled : styledObj.enabled);
};

const tabButtonTextColorValue = {
  disabled: "#6A7187",
  enabled: "#495057",
};

const tabButtonHoverRules = {
  disabled: `
    &:hover {
      cursor: default;
    }`,

  enabled: `
    &:hover {
      color: #0d47a1;
    }`,
};

const StyledTabLi = styled.li`
  .tab-button {
    position: relative;
    padding: 10px 15px;
    color: ${computeDisabledStyling(tabButtonTextColorValue)};

    ${computeDisabledStyling(tabButtonHoverRules)}

    &.active {
      color: #0d47a1;
      cursor: default;
    }

    &.active::after {
      content: " ";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2.5px;
      background-color: #0d47a1;
    }
  }
`;

function Tab({ children, tabNumber, isActive, disabled, onClick }) {
  const isTabActive = () => {
    return classnames("tab-button", { active: isActive && !disabled });
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onClick?.(tabNumber);
  };

  return (
    <StyledTabLi disabled={disabled}>
      <a className={isTabActive()} onClick={handleClick}>
        {children}
      </a>
    </StyledTabLi>
  );
}

function TabContent({ children, isActive }) {
  if (isActive) {
    return children;
  }
  return null;
}

export { TabList, Tab, TabContent };
