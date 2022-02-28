// react
import { FC } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  Typography,
  Container,
  Grid,
  Backdrop,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  progress: {
    margin: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
}));

export interface LoadingProps {
  hidden?: boolean
  label: string
}

const Loading: FC<LoadingProps> = (props) => {
  const classes = useStyles();

  return (
    <Container>
      <Backdrop
        open={!props.hidden}
        className={classes.backdrop}
      >

        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <CircularProgress
            color="secondary"
            className={classes.progress}
          />
          <Typography variant="h5">
            {props.label}
          </Typography>
        </Grid>
      </Backdrop>
    </Container>
  )
}

export default Loading;