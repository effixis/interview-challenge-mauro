// react
import { useContext } from 'react';

// material-ui
import {
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@material-ui/core';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';

// utils
import { asType } from '../utils/Helper';
import {
  InputField,
  InputFieldProps,
  InputContext,
  useInputStyles,
} from '../utils/Input';

const filter = createFilterOptions<string>();

export interface SearchFieldProps<T> {
  /**
   * If specified, a value not part of options can be entered.  
   * **Warning**: in order for it to work, T as to be string!
   */
  expandable?: boolean
  options: T[]
  label?: string
  placeholder?: string
  icon?: JSX.Element
  className?: string
  textFieldProps?: TextFieldProps
  controller?: [T | null, (v: T | null) => void]
  onChange?: (option: T | null) => void
  getOptionLabel?: (value: T) => string
  groupBy?: (value: T) => string
  /**
   * If given, the search field will be an InputField.  
   * **Warning**: inputFieldProps.textFieldProps will be overriden,
   * instead use textFieldProps directly
   */
  inputFieldProps?: InputFieldProps
  disabled?: boolean
}

function SearchField<T>(props: SearchFieldProps<T>) {

  const classesInput = useInputStyles();

  const [option, setOption] = props.controller ?
    props.controller : [undefined, undefined];

  // get potential input context
  const input = useContext(InputContext);

  // get the current value
  let value: T | null;

  // try with Input
  if (input !== null && props.inputFieldProps) {
    value = input.values[props.inputFieldProps.field];
  } else if (option !== undefined) { // try with the basic state
    value = option;
  } else { // set dummy value
    value = null;
  }

  // default props (exists in InputField too)
  let tfProps: TextFieldProps = {
    disabled: props.disabled,
    InputLabelProps: {
      shrink: true,
    },
  };

  // add optional label
  if (props.label) {
    tfProps.label = props.label;
  }

  // add optional icon
  if (props.icon) {
    tfProps.InputProps = {
      startAdornment: (
        <InputAdornment position="start">
          {props.icon}
        </InputAdornment>
      ),
    };
  }

  // merge tfProps with custom textFieldProps
  if (props.textFieldProps) {
    tfProps = { ...tfProps, ...props.textFieldProps };
  }

  // className
  // in case of InputField, apply styling to the wrapper instead
  // of the InputField directly
  let className: string = "";

  if (props.inputFieldProps) {

    // same logic as in /Input.tsx/InputField
    if (props.inputFieldProps.className !== undefined) {
      className = props.inputFieldProps.className;
    } else {
      switch (props.inputFieldProps.size) {
        case "small":
          className = classesInput.textfieldSmall;
          break;
        case "medium":
          className = classesInput.textfieldMedium;
          break;
        case "large":
          className = classesInput.textfieldLarge;
          break;
        case "fullwidth":
          className = classesInput.textfieldFull;
          break;
        default:
          className = classesInput.textfieldMedium;
      }
    }

  } else if (props.className) {
    className = props.className;
  }

  // assert that the search field is expandable, thus of type T=string
  const canExtends = (
    props.expandable &&
    (props.options.length == 0 || typeof props.options[0] === "string")
  );

  const filterOptions = canExtends ?
    (options: T[], params: FilterOptionsState<T>): T[] => {

      // we know that options is string[] (see canExtends)
      // but it's to much boilerplate to make it clear to ts
      // @ts-ignore
      const filtered = filter(options, params);

      if (params.inputValue !== '' && filtered.length == 0) {
        return asType<T[]>([params.inputValue]);
      }

      return asType<T[]>(filtered);
    }
    : undefined;

  return (
    <Autocomplete<T>
      autoSelect
      value={value}
      options={props.options}
      groupBy={props.groupBy}
      disabled={props.disabled}
      getOptionLabel={props.getOptionLabel}
      onChange={(event, newOption) => {

        // update basic controller
        if (setOption) {
          setOption(newOption);
        }

        if (props.inputFieldProps && input) {
          // in case of InputField AND of InputContext
          // update value
          const field = props.inputFieldProps.field;
          input.setValues({ ...input.values, [field]: newOption });
        }

        // call potential onChange callback
        // AFTER all other update -> onChange has highest priority
        if (props.onChange) {
          props.onChange(newOption);
        }
      }}

      filterOptions={filterOptions}

      className={className}
      renderInput={(params) => {

        // merge InputProps => avoid conflict
        if (tfProps.InputProps) {
          tfProps.InputProps = { ...params.InputProps, ...tfProps.InputProps };
        }

        if (props.inputFieldProps) {

          // set InputField as unresponsive
          // in order not to trigger setValues for each typed char
          props.inputFieldProps.unresponsive = true;

          // remove default styling of InputField
          // it's already done in className (see above)
          props.inputFieldProps.className = "";

          // merge textFieldProps (override inputFieldProps.textFieldProps)
          props.inputFieldProps.textFieldProps = { ...params, ...tfProps };

          return (
            <InputField
              {...props.inputFieldProps}
            />
          );
        }

        // The rendered TextField
        return <TextField {...{ ...params, ...tfProps }} />
      }}
    />
  )
}

export default SearchField;