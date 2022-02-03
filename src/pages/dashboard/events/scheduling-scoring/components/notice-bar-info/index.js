import * as React from "react";
import IconInfo from "components/ma/icons/mono/info";
import { StyledWrapper, IconWrapper } from "./styles";

function NoticeBarInfo({ children }) {
  return (
    <StyledWrapper>
      <IconWrapper>
        <IconInfo />
      </IconWrapper>
      <div>{children}</div>
    </StyledWrapper>
  );
}

export { NoticeBarInfo };
