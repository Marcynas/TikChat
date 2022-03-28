import './App.css';
import logo from './logo.svg';
import Linkify from 'react-linkify';
import React, { useRef, useState } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import * as Icon from 'react-bootstrap-icons';

//-----------------------------------------------------------------
firebase.initializeApp({
  apiKey: "AIzaSyC9HQMNAOqVuh5MRKBSxYd5_nHEV21f4_Y",
  authDomain: "tikchatweb.firebaseapp.com",
  projectId: "tikchatweb",
  storageBucket: "tikchatweb.appspot.com",
  messagingSenderId: "691401485298",
  appId: "1:691401485298:web:ed0959edd71842fd80996b",
  measurementId: "G-Y3B85QNHE9",
  databaseURL: "https://tikchatweb-default-rtdb.europe-west1.firebasedatabase.app/"
})
//-----------------------------------------------------------------
const auth = firebase.auth();
const firestore = firebase.firestore();
var firebaseui = require('firebaseui');
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var pokalbis = "messages";
//-----------------------------------------------------------------

//Pagrindine funkcija
function App() {
  //pasiima vartotojo duomenis
  const [user] = useAuthState(auth);
  const [isFriendsHidden, setFriendsHidden] = useState(true);
  return (
    <div className="App">
      <header className="App-header">
        <div>
          {auth.currentUser && (<button className='Hbtn fr' onClick={() => setFriendsHidden(s => !s)}>Friends <Icon.PeopleFill /></button>)}
          {user ? !isFriendsHidden ? ' Friends ' : ' Chat room ' : ' Sign in '}
          <SignOut />
        </div>
      </header>
      <section>
        {user ? !isFriendsHidden ? <Friends /> : <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}


//-----------------------------------------------------------------------PRISIJUNGIMAS
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
  //Prisijungimas kaip sveciui
  const signInAnonymous = () => {
    auth.signInAnonymously();
  }
  //Prisijungimas su Email
  const signInWithEmail = () => {
    ui.start('#firebaseui-auth-container', {
      signInOptions: [
        {
          signInFlow: 'popup',
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: true,
        }
      ]
    });
  }
  //-----------------------------------------------------------------
  //Grazina logotipa, emailform ir mygtukus prisijungimui
  return (
    <section>

      <img alt='' className="App-logo" src={logo} />
      <>Sign in using</>
      <div>
        <button className="Login-btn" onClick={signInWithGoogle}>Google <Icon.Google /></button>
        <button className="Login-btn" onClick={signInWithGithub}>Github <Icon.Github /></button>
      </div>
      <div>
        <button className="Login-btn" onClick={signInAnonymous}>Guest <Icon.PersonFill /></button>
        <button className="Login-btn" onClick={signInWithEmail}>Email <Icon.EnvelopeFill /></button>
      </div>
      <div id="firebaseui-auth-container"></div>
      
    </section >
  );
}

//Prisijungus naudotojo duomenys surasomi i database
function writeUserData(userId, name, email, photoURL) {
  const usersRef = firestore.collection('users').doc(userId);
  usersRef.set({
    userId,
    name,
    email,
    photoURL,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

//Atsijungimo mygtukas
function SignOut() {
  return auth.currentUser && (
    <button className='Hbtn out' onClick={() => auth.signOut()}>Sign Out <Icon.BoxArrowRight /></button>
  )
}
//-----------------------------------------------------------------------SUSIRASINEJIMAS
//Pokalbiu langas
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection(pokalbis);
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  writeUserData(auth.currentUser.uid, auth.currentUser.displayName, auth.currentUser.email, auth.currentUser.photoURL);

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
        <form className='formMSG' onSubmit={sendMessage}>
          <input className='formMSGinput' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message text..." required maxlength="59" />
          <button className='Hbtn snd formMSGbutton' type="submit" disabled={!formValue}><Icon.Send /></button>
        </form>
      </div>
    </div>
  </>)
}

//Zinutes burbuliukas
function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (<div className='messageBox'>
    <a className={`message ${messageClass}`}>{displayName ? displayName : "UserWithoutName"}</a>
    <div className={`message ${messageClass}`}>
      <img onClick={() => AddFriend(auth.currentUser.uid, uid, displayName,photoURL)} className='Profile-img name' src={
        photoURL ? photoURL : "https://icon-library.com/images/anonymous-icon/anonymous-icon-0.jpg"} />
      <p><Linkify properties={{ target: '_blank', style: { color: 'blue' } }}>{text}</Linkify></p>
    </div>
  </div>
  )
}
//-----------------------------------------------------------------------DRAUGAI
//Draugu langas
function Friends() {
  const friendsRef = firestore.collection('friends' + auth.currentUser.uid);
  const query = friendsRef.orderBy('createdAt');
  const [friends] = useCollectionData(query, { idField: 'id' });
  return (<>
    <div>
      <div>
        <main className='FriendBoxBox'>
        <div className='FriendBox' onClick={() => pokalbis="messages" }>Public</div>
        {friends && friends.map(fr => <FriendBox key={fr.id} friend={fr} />)}
        </main>
      </div>
    </div>
  </>)
}

function FriendBox(props) {
  const { uid, displayName ,photoURL } = props.friend;
  return (
    <div className='FriendBox' onClick={() => PakeistiPokalbi(uid)}>
    <img className='Profile-img name' src={
        photoURL ? photoURL : "https://icon-library.com/images/anonymous-icon/anonymous-icon-0.jpg"} />
        <a>{displayName ? displayName : "UserWithoutName"}</a>
    </div>
  )
}

//Prideti drauga
const AddFriend = (userId, uid, displayName,photoURL) => {
  const friendsRefSau = firestore.collection('friends' + userId).doc(uid);
  const friendsRefKitam = firestore.collection('friends' + uid).doc(userId);
  friendsRefSau.set({
    uid,
    displayName,
    photoURL,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
  friendsRefKitam.set({
    uid: auth.currentUser.uid,
    displayName: auth.currentUser.displayName,
    photoURL:auth.currentUser.photoURL,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

function PakeistiPokalbi(draugoId){
  if (draugoId.localeCompare(auth.currentUser.uid)>0){
    pokalbis = auth.currentUser.uid+"messages"+draugoId;
  }
  else{
    pokalbis = draugoId+"messages"+auth.currentUser.uid;
  }  

}

export default App;