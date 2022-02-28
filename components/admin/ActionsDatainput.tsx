// react
import { FC } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Button,
} from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(3, 2, 1, 2),
  },
  button: {
    margin: theme.spacing(0, 1),
  },
}));

export interface ActionsDataInputProps {
  /** Control wether modify & delete buttons are displayed */
  expanded?: boolean
  save?: () => void
  add?: () => void
  modify?: () => void
  delete?: () => void
  reset?: () => void
  cancel?: () => void
}

/**
 * Display all optionals buttons in the order:
 * cancel - reset - delete - modify - add - save
*/
const ActionsDataInput: FC<ActionsDataInputProps> = (props) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      justify="flex-end"
      className={classes.footer}
    >
      {props.cancel &&
        <Button
          variant="contained"
          color="primary"
          onClick={props.cancel}
          className={classes.button}
        >
          Cancel
        </Button>
      }
      {props.reset &&
        <Button
          variant="contained"
          color="primary"
          onClick={props.reset}
          className={classes.button}
        >
          Reset
        </Button>
      }
      {props.expanded && props.delete &&
        <Button
          disabled
          variant="contained"
          color="secondary"
          onClick={props.delete}
          className={classes.button}
        >
          Supprimer
        </Button>
      }
      {props.expanded && props.modify &&
        <Button
          variant="contained"
          color="primary"
          onClick={props.modify}
          className={classes.button}
        >
          Modifier
        </Button>
      }
      {props.add &&
        <Button
          variant="contained"
          color="primary"
          onClick={props.add}
          className={classes.button}
        >
          Ajouter
        </Button>
      }
      {props.save &&
        <Button
          variant="contained"
          color="secondary"
          onClick={props.save}
          className={classes.button}
        >
          Sauvegarder
        </Button>
      }
    </Grid>
  )
}

export default ActionsDataInput;