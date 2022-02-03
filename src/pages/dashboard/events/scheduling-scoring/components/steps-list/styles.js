import styled from "styled-components";

const StyledWrapper = styled.div`
  padding: 20px 0;
  background-color: var(--ma-blue);
  border-radius: 8px;

  ul.steps-list,
  ol.steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .steps-undefined {
    padding: 10px 30px 10px 40px;
    color: #ffffff;
  }
`;

const Title = styled.div`
  padding: 10px 30px 10px 40px;
  text-transform: uppercase;
  font-weight: 600;
  color: #ffffff;
`;

const StepListItemWrapper = styled.li`
  .step-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 30px 10px 40px;
    border: none;
    background-color: var(--ma-blue);
    color: #ffffff;

    transition: all 0.2s;

    &:hover {
      color: #ffffff;
      background-color: rgba(212, 226, 252, 0.08);
    }

    &.step-disabled {
      color: var(--ma-gray-400) !important;

      &:hover {
        background-color: var(--ma-blue);
      }
    }
  }

  &.active-step .step-item {
    background-color: rgba(212, 226, 252, 0.25);
    padding-left: 3.25rem;
  }
`;

const StepNumberBullet = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1em;
  width: 2em;
  height: 2em;
  border-radius: 1em;
  background-color: #ffffff;
  color: var(--ma-blue);

  &.step-disabled {
    background-color: var(--ma-gray-400);
  }
`;

export { StyledWrapper, Title, StepListItemWrapper, StepNumberBullet };
