import styled from "styled-components";

const StyledWrapper = styled.div`
  position: absolute;
  bottom: -0.5rem;
  right: 0;
  min-width: 600px;
  text-align: right;
`;

const Text = styled.span`
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  background-color: var(--ma-yellow);
  color: var(--ma-blue);
`;

export { StyledWrapper, Text };
