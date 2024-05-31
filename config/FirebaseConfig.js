import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDD_8hMleXy-1f0oceKB2T-FGcyXNEdjYc",
  authDomain: "bro-fitness.firebaseapp.com",
  projectId: "bro-fitness",
  storageBucket: "bro-fitness.appspot.com",
  messagingSenderId: "59328685533",
  appId: "1:59328685533:web:7029686d729a28cb2bc234"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };