// react
import { FC, useState, useRef, useEffect } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Typography,
  FormControlLabel,
  Switch,
} from '@material-ui/core';

import LocationOnIcon from '@material-ui/icons/LocationOn';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import HomeIcon from '@material-ui/icons/Home';

// utils
import { Inputs, Data, Firebase } from '../../utils/types';
import { InputProvider, InputField, Input } from '../../utils/Input';
import { getFormattedAddress, isAddressInput } from '../../utils/Helper';

// hooks
import useGoogleMaps from '../../hooks/useGoogleMaps';
import { useData } from '../../hooks/useData';

// components
import SearchField from '../SearchField';
import { getDistance } from '../../utils/Firebase';
import { addressDefaultValues } from '../../utils/defaultValues';

const useStyles = makeStyles((theme) => ({
  box: {
    margin: theme.spacing(2, 0, 0, 0),
  },
  forTheLayout: {
    margin: theme.spacing(1),
    width: 0,
  },
  textField: {
    margin: theme.spacing(1),
    width: "35%",
  },
  textFieldLarge: {
    margin: theme.spacing(1),
    width: "70%",
  },
}));

export interface AddressInputsProps {
  title?: string
  disabled?: boolean
  controller: Input.InputProps<Inputs.Address> | Input.InputProps<Inputs.AddressLocation>
}

const AddressInputs: FC<AddressInputsProps> = (props) => {

  const classes = useStyles();
  const { data } = useData();

  const input = props.controller;

  const [departure, setDeparture] = useState<Data.AddressLocation | null>(null);

  // use ref as it is a nightmare otherwise
  const departureRef = useRef({
    placeID: "",
    id: "",
  });

  // use a ref for the values, as otherwise, the values in
  // onDepartureChange would remain the default ones
  const inputRef = useRef(input.values);
  inputRef.current = input.values;

  const getTransportPrice = (distance?: number) => {
    const _input = input as Input.InputProps<Inputs.Address>;
    let factor = 0;
    if (_input.values.delivery) {
      factor++;
    }
    if (_input.values.returnDelivery) {
      factor++;
    }
    distance = distance ?? Number(_input.values.distance);

    // if can't compute new price -> return old one
    if (isNaN(distance)) {
      return _input.values.price;
    }

    // get cost according to threshold
    const cost = distance > data.config.transportCosts.threshold ?
      data.config.transportCosts.upper :
      data.config.transportCosts.under;

    return distance * factor * cost;
  }

  const onDestChange = (place: Firebase.GoogleMapPlace | null) => {
    if (!place) { return; }

    if (isAddressInput(input)) {
      if (!departureRef.current.placeID) { return; }

      getDistance(
        departureRef.current.placeID,
        place.placeID,
        (distance, time) => {
          input.setValues({
            ...inputRef.current as Inputs.Address,
            departureID: departureRef.current.id,
            placeID: place.placeID,
            address: place.address,
            town: place.town,
            canton: place.canton,
            postcode: place.postcode,
            distance: distance / 1000,
            duration: time,
            price: getTransportPrice(distance / 1000),
          });
        }
      );
    } else {
      input.setValues({
        ...inputRef.current,
        placeID: place.placeID,
        address: place.address,
        town: place.town,
        canton: place.canton,
        postcode: place.postcode,
        lat: place.lat ?? 0,
        lng: place.lng ?? 0,
      });
    }
  }

  useGoogleMaps(
    "google-maps-input",
    onDestChange
  );

  const onDepartureChange = (newDeparture: Data.AddressLocation | null) => {

    if (!isAddressInput(input)) { return; }

    departureRef.current = {
      placeID: newDeparture ? newDeparture.placeID : "",
      id: newDeparture ? newDeparture.id : "",
    };


    if (departureRef.current.placeID && input.values.placeID) {
      // recompute distance
      getDistance(
        departureRef.current.placeID,
        input.values.placeID,
        (distance, time) => {
          input.setValues({
            ...input.values,
            departureID: newDeparture ? newDeparture.id : "",
            distance: distance / 1000,
            duration: time,
            price: getTransportPrice(distance / 1000),
          });
        }
      );
    } else {
      input.setValues({
        ...input.values,
        departureID: newDeparture ? newDeparture.id : "",
      });
    }
  }

  /**
   * In the case where an existing event is set, update the departure state
   * to match with the event departure ID
   */
  useEffect(() => {
    if (!isAddressInput(input)) { return; }
    if (!input.values.departureID) { return; }
    if (departure && departure.id === input.values.departureID) { return; }

    const newDeparture = data.config.addresses.find(a => a.id === input.values.departureID);

    if (!newDeparture) { return; }

    // udpate component intern states to match the externally set input values
    setDeparture(newDeparture);
    departureRef.current = {
      placeID: newDeparture.placeID,
      id: newDeparture.id,
    };

  }, [input]);

  useEffect(() => {
    if (isAddressInput(input)) {
      input.setValues({
        ...input.values,
        price: getTransportPrice(input.values.distance)
      });
    }
  }, [(input.values as Inputs.Address).delivery, (input.values as Inputs.Address).returnDelivery])

  
  return (
    <>
      {props.title &&
        <Typography variant="body1">{props.title}</Typography>
      }
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="flex-end"
        className={classes.box}
      >
        <InputProvider value={input}>
          {isAddressInput(input) &&
            <>
              <SearchField
                label="Departure"
                options={data.config.addresses}
                controller={[departure, setDeparture]}
                getOptionLabel={(a) => getFormattedAddress(a)}
                onChange={onDepartureChange}
                icon={<HomeIcon />}
                className={classes.textFieldLarge}
                disabled={props.disabled}
              />
              <div className={classes.forTheLayout} />
            </>
          }
          <InputField
            field="address"
            label="Address"
            icon={<LocationOnIcon />}
            size="large"
            textFieldProps={{ id: "google-maps-input" }}
            disabled={props.disabled}
          />
          <div className={classes.forTheLayout} />
          <InputField
            field="postcode"
            label="CP"
            type="number"
            disabled={props.disabled}
          />
          <InputField
            field="town"
            label="Town"
            icon={<LocationCityIcon />}
            disabled={props.disabled}
          />
          <InputField
            field="canton"
            label="Canton"
            disabled={props.disabled}
          />
          {isAddressInput(input) &&
            <>
              <InputField
                field="distance"
                label="Distance (km)"
                type="number"
                min={0}
                textFieldProps={
                  input.values.duration && !input.validations.distance.error ?
                    {
                      helperText:
                        "(" + input.values.duration + ")"
                    } : {}
                }
                disabled={props.disabled}
              />
              <FormControlLabel
                label="Livraison"
                control={
                  <Switch
                    checked={input.values.delivery}
                    onChange={() => {
                      input.setValues({
                        ...input.values,
                        delivery: !input.values.delivery
                      });
                    }}
                    color="primary"
                    disabled={props.disabled}
                  />
                }
                className={classes.textField}
              />
              <FormControlLabel
                label="Retour"
                control={
                  <Switch
                    checked={input.values.returnDelivery}
                    onChange={() => {
                      input.setValues({
                        ...input.values,
                        returnDelivery: !input.values.returnDelivery,
                      });
                    }}
                    color="primary"
                    disabled={props.disabled}
                  />
                }
                className={classes.textField}
              />
            </>
          }

        </InputProvider>
      </Grid>
    </>
  )
}

export default AddressInputs;