// react
import { FC, createContext, useContext, useState, useEffect } from 'react';

// firebase
import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
} from '@firebase/auth';
import { getDatabase } from "firebase/database";

// utils
import { Firebase } from './types';

/*
Firebase config keys and Ids
link: https://console.firebase.google.com/u/1/project/mauro-a9ce3/settings/general/web:M2NhMTMzOGEtZGQwNy00MGQ0LThjZmMtNjIwYzdiNmZiYTY0

Activate firebase auth: 
Console -> Authentication -> Sign-In method
link: https://console.firebase.google.com/u/1/project/mauro-a9ce3/authentication/providers
*/

const firebaseConfig = {
  apiKey: "AIzaSyD14JBM7csz0gcQpuj_wlMI65JIe_DjI5E",
  authDomain: "mauro-interview.firebaseapp.com",
  databaseURL: "https://mauro-interview-default-rtdb.firebaseio.com",
  projectId: "mauro-interview",
  storageBucket: "mauro-interview.appspot.com",
  messagingSenderId: "154608618579",
  appId: "1:154608618579:web:c0a4268995f1e743d58aa6"
};

const googleMapsAPIKey = "AIzaSyDPRevJLLYECQKIUxp6WZCQaj4e0Qu39wk";

/*
Initialize the firebase app, has to be done only once.
Check if any app already exists to prevent repetition
*/
if (!getApps().length) {
  // Initialize Firebase
  initializeApp(firebaseConfig);
}

/*
Firebase authentification reference
Importing it avoids importing firebase (app & auth) everywhere
*/
export const auth = getAuth();

export const SessionPersistence = browserLocalPersistence;
export const LocalPersistence = browserSessionPersistence;

/*
For auth implementation & all of the following:
see https://blog.logrocket.com/implementing-authentication-in-next-js-with-firebase/

Custom hook
Store the user & if something is loading (firebase is fetching data) as react states.
Setup an observer to change the user/loading states once the auth state change.
Return the user & the loading state
*/
function useFirebaseAuth() {
  const [user, setUser] = useState<Firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  // listen for Firebase state change
  // use an useEffect hook to prevent setting up the observer at each rerender
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) { // signed in

        // start loading state
        setLoading(true);

        // something surely takes time here
        setUser({
          email: user.email as string,
          id: user.uid
        });

        // stop loading state
        setLoading(false);

      } else { // not signed in
        setUser(null);
        setLoading(false);
      }
    });
  }, [] /* the effect is only executed once */);

  return { user: user, loading: loading } as Firebase.Auth;
}

/*
Context, provider at root of application (_app.js)
Same data as UseFirebaseAuth (work together)
*/
const userContext = createContext<Firebase.Auth>({ user: null, loading: true });

export interface AuthProviderProps {

}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const values = useFirebaseAuth();
  return <userContext.Provider value={values}>{props.children}</userContext.Provider>;
}


export const useAuth = () => useContext(userContext);

/*
Database
Console -> Realtime Database
link: https://console.firebase.google.com/u/1/project/mauro-a9ce3/database/mauro-a9ce3-default-rtdb/data

TODO: Update the database rules
Console -> Realtime Database -> Rules
link: https://console.firebase.google.com/u/1/project/mauro-a9ce3/database/mauro-a9ce3-default-rtdb/rules

For the moment the rules are in "test" mode (read & write) for 30 days. Need to be
updated for production.

For the moment the data can be edited directly from the console.
*/

/*
Firebase database reference
Importing it avoids importing firebase (app & database) everywhere
*/
export const db = getDatabase();

/** Dynamically import google maps api */
export function importGoogleMapAPI(onLoad?: () => void) {

  const existingScript = document.getElementById('googleMaps');

  if (existingScript) {
    // trigger onLoad anyway
    if (onLoad) {
      onLoad();
    }
    return;
  }

  // create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}&libraries=places`;
  script.id = 'googleMaps';
  document.body.appendChild(script);
  script.onload = () => {
    if (onLoad) {
      onLoad();
    }
  };
}

/**
 * Call the Google maps distance matrix api
 * https://developers.google.com/maps/documentation/distance-matrix/overview
 */
export function getDistance(
  originID: string,
  destID: string,
  /** distance: meters */
  cb: (distance: number, time: string) => void
) {

  const matrix = new google.maps.DistanceMatrixService();

  matrix.getDistanceMatrix({
    origins: [{ placeId: originID }],
    destinations: [{ placeId: destID }],
    travelMode: google.maps.TravelMode.DRIVING,
  }, (response, status) => {
    if (status !== google.maps.DistanceMatrixStatus.OK || !response) {
      return;
    }

    const values = response.rows[0].elements[0];

    const distance = values.distance.value;
    const time = values.duration.text;

    cb(distance, time);
  });

}