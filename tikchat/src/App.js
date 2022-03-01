import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth' 
import { useCollectionData } from 'react-firebase-hooks/firestore'

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
  return(
    <button onClick={signInWithGoogle}> 
    Prisijungti naudojant Gmail
    </button>
  );
  
    
}
function ChatRoom(){
    
}

export default App;