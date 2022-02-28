// react
import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  ChangeEvent,
} from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  MenuItem,
  InputAdornment,
  TextFieldProps,
  Select,
  Chip,
  InputLabel,
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";

// utils
import { Models } from './types';
import { isArray, isNumber, formatNumber, deepCopy } from './Helper';

export namespace Input {

  export type BaseValue = null
    | number | number[]
    | string | string[]
    | boolean | boolean[]
    | Date | Date[]

  export type ValidationProps = {
    error: boolean
    info: string
  }

  export type CriteriaCallbackProps<T, P = unknown> = (
    key: keyof T,
    value: BaseValue,
    params: P,
  ) => ValidationProps

  export type CriteriaProps<T> = {
    [key: string]: CriteriaCallbackProps<T>
  }

  export type ValidationsProps<T> = {
    [K in keyof T]: T[K] extends Array<any> ? ValidationProps[] : ValidationProps
  }

  export type CriteriasProps<T> = {
    [K in keyof T]: CriteriaProps<T>
  }

  export type InputProps<T> = {
    values: T
    /**resetValidations defaults to true */
    setValues: (values: T, resetValidations?: boolean) => void
    validations: ValidationsProps<T>
    setValidations: (validations: ValidationsProps<T>) => void
    criterias: CriteriasProps<T>
    setCriterias: (criterias: CriteriasProps<T>) => void
    reset: () => void
    validate: <P>(params?: P) => boolean
    getDefaultValues: () => T
  }

  export type ParamsUnique<T extends Models.Unique> = {
    data: T[]
    id: string | undefined
    mode: "add" | "modify"
  }
}

// Default validation
// info has a space -> create a blank helperText
// -> avoid change in the layout when info is displayed
const DFVA = { error: false, info: " " } as Input.ValidationProps;

//////
// validations functions
export function validateRequired<T>() {
  const cb: Input.CriteriaCallbackProps<T> = (key, value) => {
    if (value === "" || value === null) {
      return {
        error: true,
        info: `${key} est requis.`,
      };
    } else {
      return DFVA;
    }
  }
  return cb;
}

export function validateNumber<T>() {
  const cb: Input.CriteriaCallbackProps<T> = (key, value) => {
    if (!isNumber(value)) {
      return {
        error: true,
        info: `${key} doit être un nombre.`,
      };
    } else {
      return DFVA;
    }
  }
  return cb;
}

export function validateMin<T>(min: number) {
  const cb: Input.CriteriaCallbackProps<T> = (key, value) => {

    if (!isNumber(value)) {
      return {
        error: true,
        info: `${key} doit être un nombre.`,
      };
    }

    if (value as number < min) {
      return {
        error: true,
        info: `${key} doit être plus grand(e) que ${min}.`,
      };
    } else {
      return DFVA;
    }
  }
  return cb;
}

export function validateMax<T>(max: number) {
  const cb: Input.CriteriaCallbackProps<T> = (key, value) => {

    if (!isNumber(value)) {
      return {
        error: true,
        info: `${key} doit être un nombre.`,
      };
    }

    if (value as number > max) {
      return {
        error: true,
        info: `${key} doit être plus petit(e) que ${max}.`,
      };
    } else {
      return DFVA;
    }
  }
  return cb;
}

/**
 * Validate that the value is unique in the given data (D)
 * 
 * Params should of type:
 * 
 *      {
 *       data: D[]
 *       id: number | undefined
 *       mode: "add" | "modify"
 *      }
 * 
 */
export function validateUniqueName<
  T extends Models.Named,
  D extends Models.Unique
>() {
  const cb: Input.CriteriaCallbackProps<T, Input.ParamsUnique<D>> = (key, value, params) => {
    let error = false;
    let info = " ";

    // assert that params are valid
    if (!params
      || !params.data
      || !params.mode) {
      throw new Error(
        `validate: field: ${key} value: ${value} - invalid params: ${params}`
      );
    }

    // knowing that value is field 'name'
    // special case
    if (value === "_NO_NAME_") {
      return { error, info };
    }

    const existingItem = params.data.filter(m => m.name === value)[0];
    if (existingItem) {

      if (params.mode === "add") {
        error = true;
        info = `Le nom "${value}" est déjà pris.`;
      } else if (params.mode === "modify" && existingItem.id !== params.id) {
        error = true;
        info = `Le nom "${value}" est déjà pris.`;
      }
    }

    if (value === "") {
      error = true;
      info = "Un nom est requis.";
    }

    return { error, info };
  }

  return cb;
}

//////
// context
export const InputContext = createContext<Input.InputProps<any> | null>(null);

interface InputProviderProps {
  value: Input.InputProps<any>
}

export const InputProvider: FC<InputProviderProps> = (props) => {
  return (
    <InputContext.Provider value={props.value}>
      {props.children}
    </InputContext.Provider>
  )
}

//////

export function useInput<Type extends {}>(defaultValues: Type) {

  //////
  // default values

  const defaultCriterias = Object.keys(defaultValues).reduce(
    (obj, key) => ({ ...obj, [key]: {} as Input.CriteriaProps<Type> }),
    {} as Input.CriteriasProps<Type>
  );

  const getDefaultValidations = (_values?: Type) => {

    // can pass value (for when values & validations updated at same time)
    const currentValues = _values ? _values : values;

    const defaultValidations = Object.keys(currentValues).reduce(
      (obj, key) => {
        const value = currentValues[key as keyof Type];
        if (isArray(value)) {
          return { ...obj, [key]: value.map(() => DFVA) as Input.ValidationProps[] };
        } else {
          return { ...obj, [key]: DFVA };
        }
      },
      {} as Input.ValidationsProps<Type>
    );

    return defaultValidations;
  }

  //////
  // states
  const [values, setValues] = useState(defaultValues);
  const [validations, setValidations] = useState(getDefaultValidations());
  const [criterias, setCriterias] = useState(defaultCriterias);

  /** use a ref as the return value to avoid 
   * trigger useEffect on each rerender when the useInput hook 
   * is a dependency of the useEffect
  */
  const returnValue = useRef<Input.InputProps<Type>>({} as Input.InputProps<Type>);

  /**
   * Note: When the length of an array value changes,
   * the validations are reset (to sync values-validations).
   * Default resetValidations: True
   */
  const setValuesExternal = (newValues: Type, resetValidations = true) => {

    let key: keyof Type;
    // update validations when array values length changes
    for (key in values) {

      const oldValue = values[key];
      const newValue = newValues[key];

      if (isArray(oldValue) && isArray(newValue)) {
        if (oldValue.length !== newValue.length) {
          resetValidations = true;
        }
      }
    }

    setValues(newValues);
    if (resetValidations) {
      setValidations(getDefaultValidations(newValues));
    }

    // change ref -> trigger useEffect
    returnValue.current = {
      ...returnValue.current,
      values: newValues
    };
  }

  const setValidationsExternal = (newValidations: Input.ValidationsProps<Type>) => {
    setValidations(newValidations);
    // change ref -> trigger useEffect
    returnValue.current = {
      ...returnValue.current,
      validations: newValidations
    };
  }

  const setCriteriasExternal = (newCriterias: Input.CriteriasProps<Type>) => {
    setCriterias(newCriterias);
    // change ref -> trigger useEffect
    returnValue.current = {
      ...returnValue.current,
      criterias: newCriterias
    };
  }

  //////
  // actions

  const getValidatationValue: Input.CriteriaCallbackProps<Type> = (key, value, params) => {
    let result = DFVA;

    // iterate over validation callbacks
    for (const cb of Object.values(criterias[key])) {

      const validation = cb(key, value, params);
      if (validation.error) {
        result = validation;
        break; // one error is enough
      }
    }
    return result;
  }

  function validate<P>(params?: P) {
    const newValidations = getDefaultValidations();
    let error = false;

    let key: keyof Type;
    for (key in values) {

      const currentValue = values[key] as unknown;
      const currentValidations = newValidations[key];

      if (isArray(currentValue) && isArray(currentValidations)) {
        for (let i = 0; i < currentValue.length; i++) {
          const validation = getValidatationValue(key, currentValue[i] as Input.BaseValue, params);
          if (validation.error) {
            currentValidations[i] = validation;
            error = true;
          }
        }
      } else {
        const validation = getValidatationValue(key, currentValue as Input.BaseValue, params);
        if (validation.error) {
          (newValidations as any)[key] = validation;
          error = true;
        }
      }
    }

    // update state
    setValidations(newValidations);

    // change ref -> trigger useEffect
    returnValue.current = {
      ...returnValue.current,
      validations: newValidations,
    };

    // return if the validation was succesful
    return !error;
  }

  const reset = () => {
    const newValues = deepCopy(defaultValues); // NOTE: use a DEEP copy !
    const newValidations = getDefaultValidations();
    setValues(newValues);
    setValidations(newValidations);
    // change ref -> trigger useEffect
    returnValue.current = {
      ...returnValue.current,
      values: newValues,
      validations: newValidations,
    };
  }

  const getDefaultValues = () => {
    return deepCopy(defaultValues);
  }
  //////

  returnValue.current.values = values;
  returnValue.current.setValues = setValuesExternal;
  returnValue.current.validations = validations;
  returnValue.current.setValidations = setValidationsExternal;
  returnValue.current.criterias = criterias;
  returnValue.current.setCriterias = setCriteriasExternal;
  returnValue.current.validate = validate;
  returnValue.current.reset = reset;
  returnValue.current.getDefaultValues = getDefaultValues;

  return returnValue.current;
}

export const useInputStyles = makeStyles((theme) => ({
  textfieldSmall: {
    margin: theme.spacing(1, 1, 0, 1), // no bottom margin -> blank helperText
    width: "15%",
  },
  textfieldMedium: {
    margin: theme.spacing(1, 1, 0, 1),
    width: "35%",
  },
  textfieldLarge: {
    margin: theme.spacing(1, 1, 0, 1),
    width: "70%",
  },
  textfieldFull: {
    width: "100%",
  },
  menuItemReset: {
    color: "rgb(140,20,20)",
  },
  menuItemAdd: {
    color: "rgb(20,140,20)",
  },
}));

export interface InputFieldProps {
  /** A field of useInput */
  field: string
  label?: string
  /** If the field's value is an array, idx specifies the array index*/
  idx?: number
  /** 
   * Setting unresponsive will disable any onChange callback
   * (including onChange prop), thus input.setValues won't be 
   * automatically called by InputField 
   */
  unresponsive?: boolean
  /** Validation: the value is not required */
  optional?: boolean
  /** If specified, the error message won't be displayed */
  noFeedback?: boolean
  size?: "small" | "medium" | "large" | "fullwidth"
  type?: "text" | "number" | "select" | "password" | "hierarchization"
  min?: number
  max?: number
  icon?: JSX.Element
  /** 
   * Options to choose from in case of type 'select' or 'hierarchization'
   * In case of 'hierarchization', the options should of the form:  
   * ```
   * [
   *  ['A1', 'A11'],
   *  ['A1', 'A12'],
   *  ['A1', 'A12', 'A121'],
   *  ['A2', 'A21'],
   * ]
   * ``` 
   */
  options?: string[] | string[][]
  /**
   * In case of type 'hierarchization',
   * specify if new value can be chosen (not part of options)
   */
  expandable?: boolean
  onChange?: (e: { target: { value: string } }) => void
  /**Specifying a custom className will completely override existing styling*/
  className?: string
  textFieldProps?: TextFieldProps
  customValidation?: (key: any, value: any, params: any) => Input.ValidationProps
  disabled?: boolean
}

export const InputField: FC<InputFieldProps> = (props) => {

  const classes = useInputStyles();

  // use to "simulate" the 'T' template arg, as can't use a template arg with a FC
  type Sample = { [key: string]: Input.BaseValue };

  const context = useContext(InputContext) as Input.InputProps<Sample> | null;

  let tfProps: TextFieldProps = {
    id: props.field,
    label: props.label,
    required: !props.optional,
    autoComplete: "off",
    disabled: props.disabled,
    InputLabelProps: {
      shrink: true,
    },
  };

  // class name
  if (props.className !== undefined) {
    tfProps.className = props.className;
  } else {
    switch (props.size) {
      case "small":
        tfProps.className = classes.textfieldSmall;
        break;
      case "medium":
        tfProps.className = classes.textfieldMedium;
        break;
      case "large":
        tfProps.className = classes.textfieldLarge;
        break;
      case "fullwidth":
        tfProps.className = classes.textfieldFull;
        break;
      default:
        tfProps.className = classes.textfieldMedium;
    }
  }

  // add validations criterias
  useEffect(() => {
    if (!context) {
      return;
    }

    const criteria = context.criterias[props.field]

    if (!props.optional) {
      criteria.required = validateRequired();
    }

    if (props.type === "number") {
      criteria.number = validateNumber();
    }

    if (props.min !== undefined) {
      criteria.min = validateMin(props.min);
    }
    if (props.max !== undefined) {
      criteria.max = validateMax(props.max);
    }

    if (props.customValidation) {
      criteria.custom = props.customValidation as Input.CriteriaCallbackProps<Sample>;
    }

  });

  // specify type
  // NOTE: setting type "number" breaks onChange (but still do it until it is noticed)
  // see: https://github.com/facebook/react/issues/16554
  if (props.type !== "select") {
    // with default value
    tfProps.type = props.type ? props.type : "text";
  }

  // select
  if (props.type === "select" && props.options) {
    tfProps.select = true;
    tfProps.children = props.options.map(
      (option) => <MenuItem value={option} key={String(option)}>{option}</MenuItem>
    );
  }

  if (props.type === "hierarchization" && props.options) {
    return (
      <InputFieldHierarchy
        field={props.field}
        noFeedback
        expandable={props.expandable}
        options={props.options as string[][]}
        onChange={props.onChange}
        textFieldProps={tfProps}
      />
    );
  }

  // value formatting
  const format = (value: Input.BaseValue) => {
    // NOTE : drop value formatting until it is noticed
    // if (props.type === "number") {
    // return formatNumber(value);
    // }
    return value;
  }

  // add useInput functionalities
  if (props.field && context) {


    const value = context.values[props.field];
    const validation = context.validations[props.field];

    if (isArray(value) && isArray(validation) && props.idx !== undefined) {
      // array value
      tfProps.value = format(value[props.idx]);

      // only setup onChange if InputField is responsive
      if (!props.unresponsive) {
        tfProps.onChange = (e) => {

          // when needed and possible: cast value
          const newValue = e.target.value;
          if (props.type === "number" && isNumber(newValue)) {
            value[props.idx as number] = Number(newValue);
          } else {
            value[props.idx as number] = newValue;
          }

          context.setValues({ ...context.values, [props.field]: value });

          // add custom onChange
          if (props.onChange) {
            props.onChange(e);
          }
        }
      }

      tfProps.error = validation[props.idx].error;
      if (!props.noFeedback) {
        tfProps.helperText = validation[props.idx].info;
      }

    } else {
      // normal value

      tfProps.value = format(context.values[props.field]);

      // only setup onChange if InputField is responsive
      if (!props.unresponsive) {
        tfProps.onChange = (e) => {

          // when needed and possible: cast value
          let newValue: string | number;
          if (props.type === "number" && isNumber(e.target.value)) {
            newValue = Number(e.target.value.replaceAll(",", "."));
          } else {
            newValue = e.target.value;
          }

          context.setValues({ ...context.values, [props.field]: newValue });

          // add custom onChange
          if (props.onChange) {
            props.onChange(e);
          }
        };
      }

      tfProps.error = (validation as Input.ValidationProps).error;
      if (!props.noFeedback) {
        tfProps.helperText = (validation as Input.ValidationProps).info;
      }
    }
  }

  // add icon
  if (props.icon) {
    tfProps.InputProps = {
      startAdornment: (
        <InputAdornment position="start">
          {props.icon}
        </InputAdornment>
      ),
    };
  }

  // add textFieldProps
  if (props.textFieldProps) {
    tfProps = {
      ...tfProps,
      ...props.textFieldProps,
    };
  }

  return <TextField {...tfProps} />
}

export const buildHierarchyOptions = (options: string[][], currentValue: string[]) => {
  const depth = currentValue.length;
  const currents: string[] = [];

  for (const list of options) {
    if (list.length <= currentValue.length) { continue; }

    // compare list & value
    const valid = currentValue.reduce((p, v, i) => p && (v === list[i]), true);
    if (!valid) { continue; }

    if (!currents.includes(list[depth])) {
      currents.push(list[depth]);
    }
  }
  return currents;
}

interface InputFieldHierarchyProps {
  /** A field of useInput */
  field: string
  /** If specified, the error message won't be displayed */
  noFeedback?: boolean
  expandable?: boolean
  /** Options hierarchy */
  options: string[][]
  onChange?: (e: { target: { value: string } }) => void
  textFieldProps: TextFieldProps
}

const InputFieldHierarchy: FC<InputFieldHierarchyProps> = (props) => {
  const classes = useInputStyles();

  // use to "simulate" the 'T' template arg
  type Sample = { [key: string]: Input.BaseValue[] };

  // displayed options
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [isDialog, setIsDialog] = useState(false);
  const [dialogValue, setDialogValue] = useState("");

  const context = useContext(InputContext) as Input.InputProps<Sample> | null;

  if (!context) {
    return null;
  }

  const tfProps = props.textFieldProps;

  const value = context.values[props.field] as string[];
  const validation = context.validations[props.field];

  useEffect(() => {
    // compute displayed options
    setCurrentOptions(buildHierarchyOptions(props.options, value));
  }, [props.options, value]);

  const handleChange = (e: ChangeEvent<{ name?: string; value: unknown }>) => {

    let value = e.target.value as string[];

    if (value[value.length - 1] === "_RESET_") {
      value = [];
    } else if (value[value.length - 1] === "_ADD_") {
      value.pop();
      setOpen(false);
      setIsDialog(true);
    }

    context.setValues({
      ...context.values,
      [props.field]: value,
    });
    setOpen(false);
  }

  const addValue = () => {
    if (dialogValue === "") { return; }
    context.setValues({
      ...context.values,
      [props.field]: [...context.values[props.field], dialogValue],
    });
    setIsDialog(false);
  }

  // NOTE validation is disabled for now ->
  // validations is stored as an array inside useInput
  // tfProps.error = validation.error;
  // if (!props.noFeedback) {
  //   tfProps.helperText = validation.info;
  // }
  tfProps.helperText = tfProps.helperText ?? " ";

  return (
    <>
      <FormControl className={tfProps.className}>
        <InputLabel id={`${tfProps.id}-label`}>
          {tfProps.label}
        </InputLabel>

        <Select
          id={tfProps.id}
          labelId={`${tfProps.id}-label`}
          error={tfProps.error}
          multiple
          open={open}
          onOpen={() => { setOpen(true); }}
          onClose={() => { setOpen(false); }}
          value={value}
          onChange={handleChange}
          renderValue={(selected) => (
            <div>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </div>
          )}
        >
          {currentOptions.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
          {props.expandable &&
            <MenuItem
              key="add-item"
              value="_ADD_"
              className={classes.menuItemAdd}
            >
              Ajouter élément
            </MenuItem>
          }
          {value.length > 0 &&
            <MenuItem
              key="reset-menu"
              value="_RESET_"
              className={classes.menuItemReset}
            >
              Reset
            </MenuItem>
          }
        </Select>
        <FormHelperText error>
          {tfProps.helperText}
        </FormHelperText>
      </FormControl>
      <Dialog
        open={isDialog}
        onClose={() => { setIsDialog(false); }}
      >
        <DialogTitle> Ajouter un élément </DialogTitle>
        <DialogContent>
          <TextField
            id="new-item-textfield"
            label="Nouvel élément"
            autoFocus
            value={dialogValue}
            onChange={(e) => {
              e.stopPropagation();
              setDialogValue(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => { setIsDialog(false); }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={addValue}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}