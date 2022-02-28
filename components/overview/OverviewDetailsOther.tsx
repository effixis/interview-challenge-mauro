// react
import { FC } from 'react';

// mui
import PeopleIcon from '@material-ui/icons/People'
import { Grid } from '@material-ui/core';

// utils
import { Inputs } from '../../utils/types';
import { InputProvider, Input, InputField } from '../../utils/Input';
import SearchField from '../SearchField';


export interface OverviewDetailsOtherProps {
  disabled?: boolean
  inputClientDate: Input.InputProps<Inputs.ClientDate>
}

const OverviewDetailsOther: FC<OverviewDetailsOtherProps> = (props) => {

  return (
    <InputProvider value={props.inputClientDate}>
      <Grid container spacing={0}>
        <Grid item xs={6}>
          <InputField
            disabled={props.disabled}
            field="people"
            label="Number of Persons"
            type="number"
            min={0}
            size="fullwidth"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={6}>
          <SearchField
            disabled={props.disabled}
            expandable
            options={[
              "Apero",
              "Apero Sugar and Salt",
              "Cocktail",
              "Apero and Menu",
              "Diner",
            ]}
            inputFieldProps={{
              size: "fullwidth",
              field: "type",
              label: "Event Type",
            }}
          />
        </Grid>
      </Grid>
    </InputProvider>
  );
}

export default OverviewDetailsOther;