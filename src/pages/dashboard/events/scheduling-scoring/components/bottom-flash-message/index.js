import * as React from "react";
import { StyledWrapper, Text } from "./styles";

function BottomFlashMessage({ children }) {
  return (
    <StyledWrapper>
      <Text>{children}</Text>
    </StyledWrapper>
  );
}

export { BottomFlashMessage };
