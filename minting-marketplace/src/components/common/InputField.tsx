import React, { /*useEffect,*/ useState } from 'react';

import { getRandomValues } from '../../utils/getRandomValues';

/***
	InputField
		Creates an input field for React Apps
	Props: 
		- Required
			- getter: Put the getter of the useState here
			- setter: Put the setter function of useState here
		- Optional Styling
			- label: The label tag won't be rendered if there isn't a label
			- customCSS and customClass: Give styling to the input
			- labelCSS and labelClass: Give styling to the Select's label
			- requiredColor: Text color in case the input is required (default null)
		- Optional Input data
			- type: By default it's text
			- required: Required inputs will have an * next to their label!
			- disabled
			- placeholder: The label of the default (disabled) option
			- min: For number inputs
			- max: For number inputs
		- Special:
			- setterField: An array of object labels where the value is (relative to the event.target)
				For example: An input field will be 'value' , as in, the data is in event.target.value
			!---	In the case of a File input, the route is event.target.files[0], ---!
			!---		so pass ['files',0] to that prop!							 ---!
**/
// eslint-disable-next-line
type TInputFieldProps<T extends any = any> = {
  getter?: HTMLInputElement['value'] | number;
  setter: (value: T) => void;
  setterField?: Array<string | number>;
  customCSS?: { [key: string]: string };
  customClass?: string;
  labelCSS?: { [key: string]: string };
  labelClass?: string;
  placeholder?: string;
  type?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  maxLength?: number;
  id?: string;
};

// eslint-disable-next-line
const InputField = <T extends any = any>({
  getter,
  setter,
  setterField = ['value'],
  customCSS = { color: 'black' },
  customClass,
  labelCSS = { color: 'inherit' },
  labelClass,
  placeholder = '',
  type,
  label,
  required,
  disabled,
  min,
  max,
  maxLength
}: TInputFieldProps<T>) => {
  const [id] = useState<number | null>(getRandomValues);

  return (
    <>
      {label && (
        <label
          htmlFor={id?.toString()}
          style={{
            ...labelCSS,
            color: labelCSS.color
          }}
          className={labelClass}>
          {label + (required ? '*' : '')}
        </label>
      )}
      <input
        type={type}
        id={id?.toString()}
        onChange={(e) =>
          setter(
            setterField.reduce((start, piece) => {
              return start[piece];
            }, e.target) as T
          )
        }
        value={getter}
        disabled={disabled}
        style={{ ...customCSS }}
        className={customClass}
        required={required ? required : false}
        min={min}
        max={max}
        maxLength={maxLength}
        placeholder={placeholder + (required ? '*' : '')}
      />
    </>
  );
};

export default InputField;
