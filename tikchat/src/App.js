import './App.css';
import logo from './logo.svg';
import React, { useRef, useEffect, useState } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth'
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
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <>
            {user ? 'Chat room' : 'Sign in'}
          </>
          <>  </>
          <SignOut />

        </div>
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }


  const signInWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <section>
      <img alt='' className="App-logo" src={logo} />
      <div>
        <>Sign in with: </>
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

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}



function ChatRoom() {

  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const [hidden, setHidden] = useState(true);


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName,
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <div className='row'>
      {!hidden ? <div className='column-firends'><Friends/></div> : null}
      <div className='column-chat'>
        <main>
          <button onClick={() => setHidden(s => !s)}>Friends</button>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>

        </main>

        <form onSubmit={sendMessage}>

          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message text..." />

          <button type="submit" disabled={!formValue}>Send</button>
        </form></div>

    </div>

  </>)
}

function Friends(){
  return(
    <>
    <main>
      Draugai
    </main>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (

    <div className={`message ${messageClass}`}>
      {displayName}
      <img className='Profile-img' src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;