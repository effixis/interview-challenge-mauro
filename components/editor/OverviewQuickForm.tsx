// react
import { useEffect } from 'react';

// mui
import { Grid, InputLabel, makeStyles } from '@material-ui/core';

// utils
import { InputProvider, InputField, InputFieldProps, useInput, Input } from '../../utils/Input';
import { HeadCell } from '../../utils/MasterTableParams';
import { Models, Optional } from '../../utils/types';
import { drinksDefaultValues, materialsDefaultValues, menusDefaultValues, platsDefaultValues } from '../../utils/defaultValues';
import { deepCopy, isArray } from '../../utils/Helper';

// components
import SearchField from '../SearchField';
import { ExpectedTarget, OverviewQuickList } from './OverviewLists';

const useStyles = makeStyles((theme) => ({
  listLabel: {
    marginBottom: theme.spacing(1)
  }
}));

// QuickForm: the Editor.

export interface OverviewQuickFormProps<T extends Models.Identifiable> {
  headers: HeadCell<T & Models.Identifiable>[]
  data?: T[]
  controller: Input.InputProps<Optional<T, "id">>
}

function OverviewQuickForm<T extends Models.Identifiable>(props: OverviewQuickFormProps<T>) {

  const getCustomValue = (header: HeadCell<T>) => {
    if (!header.arrayFormatter) { return; }
    // @ts-ignore
    const items: Models.Item[] = deepCopy(props.controller.values[header.field]);
    return items;
  }

  const roundize = (n: number) => {
    return Math.round(n * 100) / 100
  }

  const handleApplyArrayValue = (header: HeadCell<T>, items: Models.Item[], item: Models.Priced) => {
    if (!header.arrayFormatter) { return; }

    // special case: the price is reported (based on header.reportPrice).
    if (header.reportPrice) {
      props.controller.setValues({
        ...props.controller.values,
        [header.field]: items,
        price: roundize(item.price)
      });
    }

    // default case: only the collection is updated.
    else {
      props.controller.setValues({
        ...props.controller.values,
        [header.field]: items,
      });
    }
  }


  return (
    <InputProvider value={props.controller}>
      <Grid container spacing={2}>
        {props.headers.map(header => {
          return (
            <OverviewQuickFormField<T>
              key={String(header.field)}
              header={header}
              customValue={getCustomValue(header)}
              onApply={(items, item) => handleApplyArrayValue(header, items, item)}
            />
          )
        })}
      </Grid>
    </InputProvider>
  )
}

// QuickFormField: input for an attribute based on the attributes of a HeadCell header.

interface OverviewQuickFormFieldProps<T extends Models.Identifiable> {
  header: HeadCell<T>
  customValue?: Models.Item[]
  onApply: (values: Models.Item[], item: Models.Priced) => void
  onReportPrice?: (price: number) => void
}

export function OverviewQuickFormField<T extends Models.Identifiable>(props: OverviewQuickFormFieldProps<T>) {

  const header = props.header;
  const classes = useStyles();
  let defaultValues: Models.Priced = { price: 0 };

  if (header.arrayFormatter) {
    if (header.field === "menus") {
      defaultValues = menusDefaultValues;
    }
    else if (header.field === "plats") {
      defaultValues = platsDefaultValues;
    }
    else if (header.field === "materials") {
      defaultValues = materialsDefaultValues;
    }
    else if (header.field === "drinks") {
      defaultValues = drinksDefaultValues;
    }
  }

  // inititialize controller anyway
  const listController = useInput<Models.Priced>(defaultValues);

  /** TS utility function */
  const getCollection = () => {
    // @ts-ignore
    return listController.values[header.field] as Models.Item[];
  }

  const handleQuickListChange = (e: Models.Priced) => {
    props.onApply(getCollection(), e)
  }

  useEffect(() => {
    if (!header.arrayFormatter) { return; }

    if (props.customValue) {
      listController.setValues({
        ...listController.values,
        [header.field]: props.customValue,
      });
    }
    else {
      listController.reset();
    }
  }, [props.customValue]);

  if (!header.inputFieldProps) {
    return null;
  }

  if (header.arrayFormatter) {
    return (
      <Grid item xs={header.cols || 12}>
        <InputLabel className={classes.listLabel}>{header.label}</InputLabel>
        <OverviewQuickList
          label={header.dialogTitle}
          selectLabel={header.selectLabel}
          dialogTitle={header.dialogTitle}
          target={header.field as ExpectedTarget}
          controller={listController}
          onChange={handleQuickListChange}
          withoutTotal
        />
      </Grid>
    );
  }

  const inputFieldProps: InputFieldProps = {
    field: header.field.toString(),
    label: header.label,
    type: header.inputFieldProps?.type,
    size: "fullwidth",
    ...header.inputFieldProps
  }

  if (inputFieldProps.type === "select") {
    const options = header.options ? header.options : [];
    return (
      <Grid item xs={header.cols || 6}>
        <SearchField
          expandable
          options={options}
          inputFieldProps={inputFieldProps}
        />
      </Grid>
    );
  }
  else if (inputFieldProps.type === "hierarchization") {
    if (header.options) {
      const stringOptions = header.options.map(o0 => {
        return isArray(o0) ? o0.map(o1 => String(o1)) : String(o0);
      });
      inputFieldProps.options = stringOptions as (string[] | string[][]);
    }
    inputFieldProps.expandable = true;
  }
  return (
    <Grid item xs={header.cols || 6}>
      <InputField {...inputFieldProps} />
    </Grid>
  );
}

export default OverviewQuickForm