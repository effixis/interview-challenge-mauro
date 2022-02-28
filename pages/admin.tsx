// react
import { FC, useEffect, useState } from 'react';

// mui
import { makeStyles } from '@material-ui/core';
import {
  Paper,
  Typography,
  Grid,
  Button,
  Collapse,
} from "@material-ui/core";

import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

// utils
import { Inputs } from '../utils/types';
import { InputProvider, InputField, useInput } from '../utils/Input';

// hooks
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

// components
import Page from '../components/Page';
import ActionsDataInput from '../components/admin/ActionsDatainput';
import DialogConfirmation from '../components/admin/DialogConfirmation';
import AddressInputs from '../components/editor/AddressInputs';
import TableOptions from '../components/admin/TableOptions';
import LabelInput from '../components/admin/LabelInput';
import TableSorter from '../components/admin/TableSorter';
import TitleOptions from '../components/admin/TitleOptions';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
  },
  title: {
    padding: theme.spacing(2),
  },
  section: {
    padding: theme.spacing(0, 3),
  },
  transportInput: {
    margin: theme.spacing(1, 1, 0, 1),
    width: "30%",
  },
  refresh: {
    float: "inline-end",
  },
  comment: {
    paddingLeft: theme.spacing(2),
  },
  box: {
    width: theme.spacing(10),
    height: theme.spacing(8),
    borderRadius: theme.spacing(5)
  }
}));

interface AdminActionsProps {
  eraseDB: () => void
}

const AdminActions: FC<AdminActionsProps> = (props) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Typography variant="h5" className={classes.title}>
        Actions
      </Typography>
      <div className={classes.section}>
        <Grid
          container
          direction="row"
          alignItems="center"
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => { setOpen(true); }}
          >
            Réinitialiser la base de données
          </Button>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            className={classes.comment}
          >
            Efface toute les données définitivement.
          </Typography>
          <DialogConfirmation
            controllerOpen={[open, setOpen]}
            actionCallback={props.eraseDB}
          />
        </Grid>
      </div>
    </>
  );
}

export interface PageAdminProps {

}

const PageAdmin: FC<PageAdminProps> = (props) => {

  const classes = useStyles();
  const { data, update, reset } = useData();
  const { generateToast } = useToast();

  const [areValuesInit, setAreValuesInit] = useState(false);
  const [status, setStatus] = useState<"normal" | "address" | "label">("normal");

  const inputOptions = useInput<Inputs.Options>({
    wagesServer: 0,
    wagesCook: 0,
    transportCostsUpper: 0,
    transportCostsUnder: 0,
    transportCostsThreshold: 0,
    defaultStatus: data.config.defaultStatus ?? "",
  });

  const inputAddress = useInput<Inputs.AddressLocation>({
    id: undefined,
    placeID: "",
    address: "",
    postcode: 0,
    town: "",
    canton: "",
    lat: 0,
    lng: 0,
  });

  const inputLabel = useInput<Inputs.Label>({
    id: undefined,
    name: "",
    color: "#897173",
  });

  const resetValues = () => {
    inputOptions.setValues({
      wagesServer: data.config.wagesServer,
      wagesCook: data.config.wagesCook,
      transportCostsUpper: data.config.transportCosts.upper,
      transportCostsUnder: data.config.transportCosts.under,
      transportCostsThreshold: data.config.transportCosts.threshold,
      defaultStatus: data.config.defaultStatus,
    });
  }

  // initialize input values once
  useEffect(() => {
    if (!data.ready || areValuesInit) {
      return;
    }
    setAreValuesInit(true);
    resetValues();
  }, [data]);

  const saveOptions = () => {
    if (!inputOptions.validate()) {
      return;
    }
    update({
      config: {
        transportCosts: {
          upper: inputOptions.values.transportCostsUpper,
          under: inputOptions.values.transportCostsUnder,
          threshold: inputOptions.values.transportCostsThreshold,
        },
        wagesServer: inputOptions.values.wagesServer,
        wagesCook: inputOptions.values.wagesCook,
        defaultStatus: inputOptions.values.defaultStatus,
      }
    });
    generateToast("Options saved.", "success");
  }

  const saveAddress = () => {

    if (!inputAddress.validate()) {
      return;
    }

    update({
      config: { addresses: [inputAddress.values] }
    });
    generateToast("Address saved.", "success");
  }

  const saveLabel = () => {

    if (!inputLabel.validate()) {
      return;
    }

    update({
      config: { labels: [inputLabel.values] }
    });
    generateToast("Label saved.", "success");
  }

  const eraseDB = () => {
    reset();
    generateToast("Database erased.", "info");
  }

  return (
    <Page
      withAuth
      withData
      title="Admin"
    >

      <Typography variant="h4" className={classes.title}>
        Section administrateur
      </Typography>
      <Grid
        container
        direction="row"
      >
        <Grid item sm={12} lg={6}>
          <Paper className={classes.paper}>
            <Typography variant="h5" className={classes.title}>
              Options
            </Typography>
            <Grid
              container
              direction="column"
              className={classes.section}
            >
              <InputProvider value={inputOptions}>
                <InputField
                  field="wagesServer"
                  label="Salaires des serveurs"
                  type="number"
                  min={0}
                  icon={<MonetizationOnIcon />}
                />
                <InputField
                  field="wagesCook"
                  label="Salaires des cuisiniers"
                  type="number"
                  min={0}
                  icon={<MonetizationOnIcon />}
                />
                <InputField
                  field="defaultStatus"
                  label="Default status"
                  type="select"
                  options={["Confirmed", "Offer", "Cancelled"]}
                />
                <TitleOptions
                  title="Transport"
                />
                <div>
                  <InputField
                    field="transportCostsUnder"
                    label="Frais kilométriques (sous seuil)"
                    type="number"
                    min={0}
                    className={classes.transportInput}

                  />
                  <InputField
                    field="transportCostsUpper"
                    label="Frais kilométriques (sur seuil)"
                    type="number"
                    min={0}
                    className={classes.transportInput}
                  />
                  <InputField
                    field="transportCostsThreshold"
                    label="Seuil"
                    type="number"
                    min={0}
                    className={classes.transportInput}
                  />
                </div>
              </InputProvider>
              <TableOptions
                title="Addresses"
                data={data.config.addresses}
                headers={["address", "postcode", "town", "canton"]}
                add={() => {
                  setStatus("address");
                  inputAddress.reset();
                }}
                modify={(address) => {
                  setStatus("address");
                  inputAddress.setValues(address);
                }}
                delete={() => {
                  generateToast("Not implemented", "error");
                }}
              />
              <TableOptions
                title="Labels"
                data={data.config.labels}
                headers={["color", "name"]}
                add={() => {
                  setStatus("label");
                  inputLabel.reset();
                }}
                modify={(label) => {
                  setStatus("label");
                  inputLabel.setValues(label);
                }}
                delete={() => {
                  generateToast("Not implemented", "error");
                }}
              />
              <TableSorter
                title="Catégories"
              />
            </Grid>
            <ActionsDataInput
              expanded
              save={saveOptions}
              reset={resetValues}
            />
          </Paper>
        </Grid>
        <Grid item sm={12} lg={6}>
          <Paper className={classes.paper}>
            <Collapse in={status === "normal"}>
              <AdminActions
                eraseDB={eraseDB}
              />
            </Collapse>
            <Collapse in={status === "address"}>
              <AddressInputs
                title="Adresse principale"
                controller={inputAddress}
              />
              <ActionsDataInput
                expanded={false}
                cancel={() => {
                  inputAddress.reset();
                  setStatus("normal");
                }}
                save={() => {
                  saveAddress();
                  setStatus("normal");
                }}
              />
            </Collapse>
            <Collapse in={status === "label"}>
              <LabelInput
                controller={inputLabel}
              />
              <ActionsDataInput
                expanded={false}
                cancel={() => {
                  inputLabel.reset();
                  setStatus("normal");
                }}
                save={() => {
                  saveLabel();
                  setStatus("normal");
                }}
              />
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}

export default PageAdmin;