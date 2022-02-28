// react
import { FC } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Grid,
} from '@material-ui/core';

import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles((theme) => ({
  title: {
    minWidth: theme.spacing(60),
  },
}));

export interface DialogConfirmationProps {
  controllerOpen: [boolean, (open: boolean) => void]
  /* The action to perform in case of confirmation*/
  actionCallback: () => void
  message?: string
}

const DialogConfirmation: FC<DialogConfirmationProps> = (props) => {

  const classes = useStyles();
  const [open, setOpen] = props.controllerOpen;

  const message = props.message ?
    props.message :
    "Êtes-vous sûr de vouloir continuer?";

  return (
    <Dialog
      open={open}
      onClose={() => { setOpen(false); }}
      maxWidth={false}
    >
      <DialogTitle
        className={classes.title}
      >
        <Grid
          container
          direction="row"
          alignItems="center"
        >
          <WarningIcon color="error" fontSize="large" />
          <Typography variant="h5" color="error">
            Warning
          </Typography>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <Typography>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => { setOpen(false); }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setOpen(false);
            props.actionCallback();
          }}
        >
          Procéder
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogConfirmation;