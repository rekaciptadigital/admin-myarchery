import styled from "styled-components";

import { Button } from "reactstrap";

export const ButtonBiru = styled(Button)`
  background-color: #0d47a1;
  border: solid 1px #0d47a1;
  color: #ffffff;

  &:hover {
    background-color: #0f53bb;
    border: solid 1px #0f53bb;
  }
`;

export const ButtonMerah = styled(Button)`
  background-color: #bf152c;
  border: solid 1px #bf152c;
  color: #ffffff;

  &:hover {
    background-color: #cf1730;
    border: solid 1px #cf1730;
  }
`;
