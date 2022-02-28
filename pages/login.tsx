// next
import { useRouter } from 'next/router';

// react
import { FC, useState } from 'react';

// mui
import { makeStyles } from '@material-ui/core/styles';
import {
  Avatar,
  Button,
  CssBaseline,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Grid,
  Typography,
} from '@material-ui/core';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

// firebase
import { setPersistence, signInWithEmailAndPassword } from 'firebase/auth';

// utils
import { auth, SessionPersistence, LocalPersistence } from '../utils/Firebase';
import { useInput, InputProvider, InputField } from '../utils/Input';

// hooks
import { useData } from '../hooks/useData';

// components
import Page from '../components/Page';

/*
mock login:
mail: test@example.com
last & first names: Test Example
password: 9488217
*/

/*
original file: https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/sign-in-side/SignInSide.js
*/

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(/loginBackground.jpeg)', // The background image
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue. (?)
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  rowGrid: {
    alignItems: "center"
  },
  errorWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

export interface PageLoginProps {

}

const PageLogin: FC<PageLoginProps> = () => {

  const classes = useStyles();
  const router = useRouter();

  const input = useInput({
    email: "",
    password: "",
    checkRemember: true,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const { refetch } = useData();

  const signIn = async () => {

    // validate inputs first
    if (!input.validate()) {
      return;
    }

    // select the persitence type (session | local)
    const persistence = input.values.checkRemember ? LocalPersistence : SessionPersistence;

    // Set correct persistence
    setPersistence(auth, persistence)
      .then(() => {
        // sign in
        signInWithEmailAndPassword(auth, input.values.email, input.values.password)
          .then(() => {
            // sign in succesful -> redirect to home page
            input.reset();
            setErrorMessage("");

            // refetch -> now the user is logged
            refetch();
            router.push("/");
          })
          .catch((error) => {
            // sign in failed -> display error message
            setErrorMessage(error.message);
          });
      })
      .catch((error) => {
        // persitence failed -> display error message
        setErrorMessage(error.message);
      })
  }

  return (
    <Page
      noAppHeader
      title="Login"
    >
      <Grid container component="main" className={classes.root}>

        <CssBaseline /> {/* If not there, will be a margin on the body tag */}

        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <div className={classes.form}>
              <InputProvider value={input}>
                <InputField
                  field="email"
                  label="Email Address"
                  size="fullwidth"
                />
                <InputField
                  field="password"
                  label="Password"
                  type="password"
                  size="fullwidth"
                  textFieldProps={{
                    autoComplete: "current-password"
                  }}
                />

                <Grid container className={classes.rowGrid}>
                  <Grid item xs>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={input.values.checkRemember}
                          name="checkRemember"
                          color="primary"
                          onChange={(e) => {
                            input.setValues({
                              ...input.values,
                              checkRemember: e.target.checked,
                            });
                          }}
                        />
                      }
                      label="Remember me"
                    />
                  </Grid>

                  {/*Forgot password functionality to be implemented*/}
                  <Grid item xs style={{ textAlign: "right" }}>
                    <Link href="#" variant="body1">
                      Forgot password?
                    </Link>
                  </Grid>
                </Grid>

              </InputProvider>

              <Typography color="error" className={classes.errorWrapper}>
                {errorMessage &&
                  <>
                    <ErrorOutlineIcon />
                    {errorMessage}
                  </>
                }
              </Typography>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={signIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </Page>
  );
}

export default PageLogin;