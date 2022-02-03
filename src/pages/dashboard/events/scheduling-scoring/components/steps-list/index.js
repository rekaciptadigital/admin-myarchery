import * as React from "react";
import classnames from "classnames";
import { StyledWrapper, Title, StepListItemWrapper, StepNumberBullet } from "./styles";

const StepsContext = React.createContext();

function StepsList({ title, children, currentStep, onChange }) {
  return (
    <StepsContext.Provider value={{ currentStep, onChange }}>
      <StyledWrapper>
        {title && <Title>{title}</Title>}
        {children?.length && <ol className="steps-list">{children}</ol>}
      </StyledWrapper>
    </StepsContext.Provider>
  );
}

function StepItem({ children, step: stepProp, icon, disabled }) {
  const { currentStep, onChange } = React.useContext(StepsContext);
  const step = parseInt(stepProp);

  if (!stepProp) {
    return null;
  }
  return (
    <StepListItemWrapper className={classnames({ "active-step": currentStep === step })}>
      <button
        className={classnames("step-item", { "step-disabled": disabled })}
        disabled={disabled}
        onClick={() => onChange?.(step)}
      >
        {(icon || stepProp) && (
          <StepNumberBullet className={classnames({ "step-disabled": disabled })}>
            {icon || stepProp}
          </StepNumberBullet>
        )}
        {children}
      </button>
    </StepListItemWrapper>
  );
}

export { StepsList, StepItem };
