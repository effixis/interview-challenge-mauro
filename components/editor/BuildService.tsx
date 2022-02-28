// react
import { FC } from 'react';

// mui
import { Grid } from '@material-ui/core';

// utils
import { Inputs } from '../../utils/types';
import { Input, InputProvider, InputField } from '../../utils/Input';

// hooks
import { useData } from '../../hooks/useData';

export interface BuildServiceProps {
  controller: Input.InputProps<Inputs.Service>
  disabled?: boolean
}

const BuildService: FC<BuildServiceProps> = (props) => {

  const { data } = useData();
  const input = props.controller;

  const computePrice = (action: keyof Inputs.Service, e: { target: { value: string }}) => {
    let values = input.values;
    if (action && values[action] !== undefined && e.target.value) {
      values[action] = Number(e.target.value);
      const priceCooks = values.cooksN * values.cooksDuration * data.config.wagesCook;
      const priceServers = values.serversN * values.serversDuration * data.config.wagesServer;
      input.setValues({
        ...values,
        price: priceCooks + priceServers
      });
    }
  }

  return (
    <InputProvider value={input}>
      <Grid container spacing={0}>
        <Grid item xs={6}>
          <InputField
            field="serversN"
            label="Nombre (serveurs)"
            min={0}
            type="number"
            size="fullwidth"
            onChange={(e) => computePrice('serversN', e)}
            disabled={props.disabled}
          />
        </Grid>
        <Grid item xs={6}>
          <InputField
            field="serversDuration"
            label="Durée (serveurs)"
            min={0}
            type="number"
            size="fullwidth"
            onChange={(e) => computePrice('serversDuration', e)}
            disabled={props.disabled}
          />
        </Grid>
      </Grid>
      <Grid container spacing={0}>
        <Grid item xs={6}>
          <InputField
            field="cooksN"
            label="Nombre (cuisiniers)"
            min={0}
            type="number"
            size="fullwidth"
            onChange={(e) => computePrice('cooksN', e)}
            disabled={props.disabled}
          />
        </Grid>
        <Grid item xs={6}>
          <InputField
            field="cooksDuration"
            label="Durée (cuisiniers)"
            min={0}
            type="number"
            size="fullwidth"
            onChange={(e) => computePrice('cooksDuration', e)}
            disabled={props.disabled}
          />
        </Grid>
      </Grid>
    </InputProvider>
  );
}

export default BuildService;