import './App.css';
import logo from './logo.svg';
import React, { useRef, useEffect, useState } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import * as Icon from 'react-bootstrap-icons';


//---------------------------------
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
//---------------------------------

//Pagrindine funkcija
function App() {
  //pasiima vartotojo duomenis
  const [user] = useAuthState(auth);
  const [isFriendsHidden, setFriendsHidden] = useState(true);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {auth.currentUser && (<button className='Hbtn fr' onClick={() => setFriendsHidden(s => !s)}>Friends <Icon.PeopleFill/></button>)}
          {user ? !isFriendsHidden ? ' Friends ' : ' Chat room ' : ' Sign in '}
          <SignOut />
        </div>
      </header>
      <section>
        {user ? !isFriendsHidden ? <Friends />  : <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

//Prisijungimo langas
function SignIn() {
  //Skirtingi prisijungimo budai
  //---------------------------------
  //Prisijungimas su Google
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  //Prisijungimas su Github
  const signInWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider);
  }
  //---------------------------------

  //Grazina logotipa ir du mygtukus prisijungimui
  return (
    <section>

      <img alt='' className="App-logo" src={logo} />
      <>Sign in using</>
      <div>
        <button className="Login-btn" onClick={signInWithGoogle}>Google <Icon.Google/></button>
        <button className="Login-btn" onClick={signInWithGithub}>Github <Icon.Github/></button>
      </div>
    </section>
  );
}

//Atsijungimo mygtukas
function SignOut() {
  return auth.currentUser && (
    <button className='Hbtn out' onClick={() => auth.signOut()}>Sign Out <Icon.BoxArrowRight/></button>
  )
}

//Pokalbiu langas
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

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
    <div>
      <div>
        <main className='main-chat'>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </main>
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message text..." required maxlength="59" />
          <button className='Hbtn snd' type="submit" disabled={!formValue}><Icon.Send/></button>
        </form>
      </div>
    </div>
  </>)
}


//Draugu langas
function Friends() {
  return (
    <>
      <main>
        Draugai
      </main>
    </>
  )
}

//Zinutes burbuliukas
function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<div className='messageBox'>
    <a className={`message ${messageClass}`}>{displayName ? displayName : "GithubUser"}</a>
    <div className={`message ${messageClass}`}>
      <img className='Profile-img name' src={
        photoURL ? photoURL : "https://icon-library.com/images/anonymous-icon/anonymous-icon-0.jpg"} />
      <p>{text}</p>
    </div>
  </div>


  )
}

export default App;