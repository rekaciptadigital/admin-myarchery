import * as React from "react";
import styled from "styled-components";
import RCCheckbox from "rc-checkbox";
import 'rc-checkbox/assets/index.css';

import "rc-checkbox/assets/index.css";

function Checkbox({ ...props }) {
  return <StyledCheckbox {...props} />;
}

const StyledCheckbox = styled(RCCheckbox)`
  &.rc-checkbox:hover .rc-checkbox-inner,
  .rc-checkbox-input:focus + .rc-checkbox-inner {
    border-color: var(--ma-blue);
  }
  &.rc-checkbox-checked:hover .rc-checkbox-inner {
    border-color: var(--ma-blue);
  }
  &.rc-checkbox-checked .rc-checkbox-inner {
    border-color: var(--ma-blue);
    background-color: var(--ma-blue);
  }

  &.rc-checkbox-disabled.rc-checkbox-checked .rc-checkbox-inner {
    background-color: #f3f3f3;
  }
  &.rc-checkbox-disabled.rc-checkbox-checked:hover .rc-checkbox-inner {
    border-color: #d9d9d9;
  }
  &.rc-checkbox-disabled .rc-checkbox-inner {
    border-color: #d9d9d9;
    background-color: #f3f3f3;
  }
  &.rc-checkbox-disabled:hover .rc-checkbox-inner {
    border-color: #d9d9d9;
  }
`;

export default Checkbox;
