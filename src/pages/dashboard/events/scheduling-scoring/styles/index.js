import styled from "styled-components";

const StyledPageWrapper = styled.div`
  margin: 2.5rem 0;
`;

const StickyContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.5rem;
`;

const StickyItem = styled.div`
  position: sticky;
  z-index: 100;
  @media (max-width: 782px) {
    position: static;
  }

  top: calc(70px + 2.5rem);
  flex: 1 1 15rem;
`;

const StickyItemSibling = styled.div`
  flex: 12 1 30rem;
`;

const StickyBlindOverlay = styled.div`
  position: absolute;
  top: calc(-1 * (70px + 2.5rem));
  z-index: -1;
  background-color: var(--bs-body-bg);
  width: 100%;
  height: 240px;
`;

export { StyledPageWrapper, StickyContainer, StickyItem, StickyItemSibling, StickyBlindOverlay };
