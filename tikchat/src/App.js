import './App.css';
import logo from './logo.svg';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { signInWithPopup, TwitterAuthProvider } from "firebase/auth";
import { useAuthState, useSignInWithGithub, useSignInWithGoogle, useSignInWithTwitter } from 'react-firebase-hooks/auth' 
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getAuth } from 'firebase/auth';

firebase.initializeApp({
  apiKey: "AIzaSyC9HQMNAOqVuh5MRKBSxYd5_nHEV21f4_Y",
  authDomain: "tikchatweb.firebaseapp.com",
  projectId: "tikchatweb",
  storageBucket: "tikchatweb.appspot.com",
  messagingSenderId: "691401485298",
  appId: "1:691401485298:web:ed0959edd71842fd80996b",
  measurementId: "G-Y3B85QNHE9"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const[user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
      </header>
    </div>
  );
}
function SignIn(){

  const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }

  const signInWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <section>
      <img className="App-logo" src={logo}/>
      <div>
        <a>Sign in with: </a>
      <button className="Login-btn" onClick={signInWithGoogle}> 
    Google
    </button>
    <button className="Login-btn" onClick={signInWithGithub}> 
    Github
    </button> 
      </div>
    <div>

    </div>
    </section>
  );    

}
function ChatRoom(){

 
  const signOut = () => {
    return auth.currentUser && (
        <button onClick={() => auth.signOut()}>Sign Out</button>
    );
  }
  //Sito nebus
    return(
      <button onClick={() => auth.signOut()}>Sign Out</button>
    );
  
}

export default App;