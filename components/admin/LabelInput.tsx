// react
import { FC, useState } from 'react';

// mui
import { DialogTitle, makeStyles } from '@material-ui/core';
import {
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  Button,
} from "@material-ui/core";

// utils
import { Inputs } from '../../utils/types';
import { InputProvider, InputField, Input, useInput } from '../../utils/Input';

const useStyles = makeStyles((theme) => ({
  cell: {
    width: theme.spacing(10),
    height: theme.spacing(8),
    borderWidth: "3px",
    borderStyle: "solid",
    borderColor: "white"
  },
  button: {
    width: "100%",
    height: "100%",
  },
  icon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
}));


export interface LabelInputProps {
  controller: Input.InputProps<Inputs.Label>
}

const LabelInput: FC<LabelInputProps> = (props) => {

  const classes = useStyles();
  const input = props.controller;

  const [open, setOpen] = useState(false);

  const colors = [
    "#388e3c",
    "#007ff0",
    "#e67319",
    "#80cbc4",
    "#a7003d",
    "#D828CC",
    "#897173",
    "#d8cc28",
    "#93471C",
  ];

  const pickColor = (color: string) => {
    input.setValues({
      ...input.values,
      color: color,
    });
    setOpen(false);
  }

  return (
    <InputProvider value={input}>
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
      >
        <InputField
          field="name"
          label="Label name"
        />
        <Button
          onClick={() => { setOpen(true); }}
          variant="contained"
          style={{ backgroundColor: input.values.color, color: "white" }}
        >
          Pick color
        </Button>
        <Chip
          label={input.values.name}
          style={{ backgroundColor: input.values.color, color: "white" }}
        />
      </Grid>

      <Dialog
        open={open}
        onClose={() => { setOpen(false) }}
      >
        <DialogTitle>
          Colors
        </DialogTitle>
        <DialogContent>
          <Grid container>
            {colors.map(color => (
              <Grid
                item
                xs={4}
                style={{ backgroundColor: color }}
                key={color}
                className={classes.cell}
              >
                <Button
                  onClick={() => { pickColor(color); }}
                  className={classes.button}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => { setOpen(false); }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </InputProvider>
  );
}

export default LabelInput;