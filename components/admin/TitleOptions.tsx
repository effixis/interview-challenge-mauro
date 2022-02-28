// mui
import { makeStyles } from "@material-ui/core";
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
  box: {
    margin: theme.spacing(1, 0, 0, 0),
  },
}));

export interface TitleOptionsProps {
  title: string
  add?: () => void
}

function TitleOptions(props: TitleOptionsProps) {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="center"
      className={classes.box}
    >
      <Typography variant="h6">
        {props.title}
      </Typography>

      {props.add &&
        <Tooltip title="Ajouter" arrow>
          <IconButton
            color="primary"
            onClick={props.add}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      }

    </Grid>
  );
}

export default TitleOptions;