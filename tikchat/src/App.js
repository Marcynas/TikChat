import './App.css';
import logo from './logo.svg';
import Linkify from 'react-linkify';
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
  measurementId: "G-Y3B85QNHE9",
  databaseURL: "https://tikchatweb-default-rtdb.europe-west1.firebasedatabase.app/"
})
const auth = firebase.auth();
const firestore = firebase.firestore();
var firebaseui = require('firebaseui');
var ui = new firebaseui.auth.AuthUI(firebase.auth());
//---------------------------------

var isEmLogin = false;
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
      {
        user ? !isFriendsHidden ? <Friends /> : <ChatRoom /> : <SignIn />
        }
      </section>
    </div>
    
  );
}

function LoginForm(){
  return(
    <section id="firebaseui-auth-container"> </section>
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
  const signInAnonymous = () => {
    auth.signInAnonymously();
  }

  var size = "small";
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
    size = "big";
  }
  
  //---------------------------------
  //Grazina logotipa ir du mygtukus prisijungimui
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

//Pokalbiu langas
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
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
      <img onClick={() => AddFriend(auth.currentUser.uid, uid)} className='Profile-img name' src={
        photoURL ? photoURL : "https://icon-library.com/images/anonymous-icon/anonymous-icon-0.jpg"} />
      <p><Linkify properties={{ target: '_blank', style: { color: 'blue' } }}>{text}</Linkify></p>
    </div>
  </div>
  )
}

//Draugu langas
function Friends() {
  const friendsRef = firestore.collection('friends' + auth.currentUser.uid);
  const query = friendsRef.orderBy('createdAt');
  const [friends] = useCollectionData(query, { idField: 'id' });
  return (<>
    <div>
      <div>
      <main>
          {friends && friends.map(fr => <FriendLine key={fr.id} friend={fr} />)}
        </main>
      </div>
    </div>
  </>)
}

function FriendLine(props) {
  const { userIdFR } = props.friend;

  console.log(  getData(userIdFR).then((name)=>{
    return name
  }
  ))
  return (<div className='messageBox'>
  <main>
  {userIdFR}
  </main>
</div>
);
};

const getData = async (userIdFR) =>{
  try{
  return  await (firestore.collection('users').doc(userIdFR).get()).then((a) =>{
    a.then((doc) => {
      return doc.data().name
    }
    )
  })
  }
  catch(err){
    return "name";
  }
}


const AddFriend = (userId, userIdFR) => {
  const friendsRef = firestore.collection('friends' + userId).doc(userIdFR);
  friendsRef.set({
    userIdFR,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

export default App;