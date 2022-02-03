import styled from "styled-components";

const StyledTabs = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const StyledButtonItem = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  border: none;
  padding: 0.875rem 0.75rem;
  min-width: 12.5rem;
  border-top-left-radius: 0.625rem;
  border-top-right-radius: 0.625rem;
  background-color: var(--ma-blue);

  color: #ffffff;
  font-weight: 400;

  transition: all 0.2s;

  &.tab-disabled:disabled {
    background-color: var(--ma-blue);
    color: #ffffff;
    font-weight: 400;
  }

  &:disabled {
    background-color: #ffffff;
    color: var(--ma-txt-black);
    font-weight: 600;
  }
`;

const IconWrapper = styled.span`
  margin-right: 0.875rem;
  color: var(--ma-blue);
`;

const FolderPanel = styled.div`
  background-color: #ffffff;
  padding: 1.25rem;
`;

export { StyledTabs, StyledButtonItem, IconWrapper, FolderPanel };
