import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Label } from "reactstrap";

const RadioButtonInput = ({
  name,
  label,
  options = [
    {
      id: 1,
      label: "Default",
    },
  ],
  onChange,
  validation,
  value,
  valueOnly = false,
  disabled,
  readOnly,
  checked,
}) => {
  const [checkedOption, setCheckedOption] = useState();
  const [error, setError] = React.useState(null);

  const handleChange = (e, option) => {
    setCheckedOption(option);
    if (onChange)
      onChange({
        key: name,
        value: valueOnly ? option.id : option,
      });
  };

  const handleBlur = (ev) => {
    if (validation?.required) {
      if (!ev.target.checked) {
        setError((errors) => {
          return {
            ...errors,
            [name]: [validation.required],
          };
        });
      } else {
        setError((errors) => {
          const updatedErrors = { ...errors };
          delete updatedErrors[name];
          return updatedErrors;
        });
      }
    }
  };

  const Button = ({ id, label }) => (
    <>
      <input
        type="radio"
        className="btn-check"
        name={name}
        id={id}
        autoComplete="off"
        onChange={(e) => handleChange(e, { id, label })}
        onBlur={handleBlur}
        checked={id === checkedOption?.id || checked}
        disabled={disabled}
        readOnly={readOnly}
      />
      <label
        className={`btn ${_.get(error, name) ? "btn-outline-danger" : "btn-outline-primary"}`}
        htmlFor={id}
      >
        {label}
      </label>
    </>
  );

  useEffect(() => {
    const option = _.find(options, ["id", value]);
    setCheckedOption(option);
  }, []);

  return (
    <div className="radio-button-input">
      {label && <Label className="form-label">{label}</Label>}
      <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
        {options.map((option) => (
          <Button id={option.id} key={option.id} label={option.label} />
        ))}
      </div>
      {_.get(error, name)?.map((message) => (
        <div className="invalid-feedback" key={message}>
          {message}
        </div>
      ))}
    </div>
  );
};

export default RadioButtonInput;
