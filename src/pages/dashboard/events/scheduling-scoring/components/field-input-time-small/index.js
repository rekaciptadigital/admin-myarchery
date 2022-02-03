import * as React from "react";

import DatePicker from "react-datepicker";

import { FieldInputTimeWrapper } from "./styles";

import id from "date-fns/locale/id";
import classnames from "classnames";

function FieldInputTimeSmall({
  children,
  label,
  required,
  name,
  placeholder = "00:00",
  value,
  onChange,
  interval,
  disabled,
  errors,
  warnings,
}) {
  const fieldID = name ? `field-input-${name}` : undefined;

  return (
    <FieldInputTimeWrapper>
      {(children || label) && (
        <label className="field-label" htmlFor={fieldID}>
          {children || label}
          {required && <span className="field-required">*</span>}
        </label>
      )}
      <DatePicker
        className={classnames("field-input-time", {
          "error-invalid": errors?.length,
          "warning-validation": warnings?.length,
        })}
        id={fieldID}
        name={name}
        selected={value}
        onChange={(date) => onChange?.(date)}
        placeholderText={placeholder}
        locale={id}
        timeFormat="H:mm"
        dateFormat="H:mm"
        timeIntervals={interval || 15}
        timeCaption="Pukul"
        showTimeSelect
        showTimeSelectOnly
        disabled={disabled}
      />
    </FieldInputTimeWrapper>
  );
}

export { FieldInputTimeSmall };
