import * as React from "react";

import DatePicker from "react-datepicker";

import { FieldInputDateWrapper } from "./styles";

import id from "date-fns/locale/id";
import classnames from "classnames";

function FieldInputDateSmall({
  children,
  label,
  required,
  name,
  placeholder = "DD/MM/YYYY",
  value,
  onChange,
  disabled,
  errors,
  warnings,
}) {
  const fieldID = name ? `field-input-${name}` : undefined;

  return (
    <FieldInputDateWrapper>
      {(children || label) && (
        <label className="field-label" htmlFor={fieldID}>
          {children || label}
          {required && <span className="field-required">*</span>}
        </label>
      )}
      <DatePicker
        className={classnames("field-input-date", {
          "error-invalid": errors?.length,
          "warning-validation": warnings?.length,
        })}
        id={fieldID}
        name={name}
        selected={value}
        onChange={(date) => onChange?.(date)}
        placeholderText={placeholder}
        locale={id}
        dateFormat="dd/MM/yyyy"
        disabled={disabled}
      />
    </FieldInputDateWrapper>
  );
}

export { FieldInputDateSmall };
