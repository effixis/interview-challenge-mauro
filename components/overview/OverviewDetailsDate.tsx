// react
import { FC } from 'react';

// mui
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { Grid } from '@material-ui/core';

// date-io
import DateFnsUtils from '@date-io/date-fns';

// utils
import { Inputs } from '../../utils/types';
import { InputProvider, Input } from '../../utils/Input';


export interface OverviewClientProps {
  disabled?: boolean
  inputClientDate: Input.InputProps<Inputs.ClientDate>
  onDateChange?: (date: Date) => void
}

const OverviewClient: FC<OverviewClientProps> = (props) => {

  const inputClientDate = props.inputClientDate;

  const handleDateChange = (date: Date | null) => {
    if (!(date instanceof Date) || isNaN(date.valueOf())) {
      return;
    }
    if (props.onDateChange) {
      props.onDateChange(date);
    }

    inputClientDate.setValues({ ...inputClientDate.values, date }, false); // don't reset validations
  }

  return (
    <>
      <InputProvider value={inputClientDate}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <KeyboardDatePicker
                disabled={props.disabled}
                margin="normal"
                id="date-picker-dialog"
                label="Date"
                format="MM/dd/yyyy"
                value={inputClientDate.values.date}
                onChange={handleDateChange}
                error={inputClientDate.validations.date.error}
                helperText={inputClientDate.validations.date.info}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <KeyboardTimePicker
                disabled={props.disabled}
                margin="normal"
                id="time-picker"
                label="Delivery Time"
                value={inputClientDate.values.date}
                onChange={handleDateChange}
                error={inputClientDate.validations.date.error}
                helperText={inputClientDate.validations.date.info}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </InputProvider>
    </>
  );
}

export default OverviewClient;