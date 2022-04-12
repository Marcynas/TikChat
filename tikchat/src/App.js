import './App.css';
import { makePhoto, generateName } from './generator.js';
import logo from './logo.svg';
import Linkify from 'react-linkify';
import React, { useRef, useState, useEffect } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import * as Icon from 'react-bootstrap-icons';
import { updateProfile } from 'firebase/auth';
import { enableIndexedDbPersistence } from 'firebase/firestore';
import 'firebase/compat/storage';

//-----------------------------------------------------------------
firebase.initializeApp({
  apiKey: "AIzaSyC9HQMNAOqVuh5MRKBSxYd5_nHEV21f4_Y",
  authDomain: "tikchatweb.firebaseapp.com",
  storageBucket: 'gs://tikchatweb.appspot.com/',
  projectId: "tikchatweb",
  messagingSenderId: "691401485298",
  appId: "1:691401485298:web:ed0959edd71842fd80996b",
  measurementId: "G-Y3B85QNHE9",
  databaseURL: "https://tikchatweb-default-rtdb.europe-west1.firebasedatabase.app/",
})

//-----------------------------------------------------------------
const auth = firebase.auth();
const firestore = firebase.firestore();
var firebaseui = require('firebaseui');
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var pokalbis = "messages";
var storage = firebase.storage();

var Filter = require('bad-words'), filter = new Filter();


enableIndexedDbPersistence(firestore)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      // ...
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      // ...
    }
  });
// Subsequent queries will use persistence, if it was enabled successfully

//-----------------------------------------------------------------

//-----------------------------------------------------------------------PAGRINDINEFUNKCIJA
function App() {
  //pasiima vartotojo duomenis
  const [user] = useAuthState(auth);
  const [screen, setScreen] = useState('ChatRoom');
  const handleClick = (screenState) => {
    setScreen(screenState)
  } //pakeicia ekrana

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {user ? (() => {
            switch (screen) {
              case 'ChatRoom':
                return <><button className='Hbtn fr' onClick={() => { handleClick('Friends') }}>Friends <Icon.PeopleFill /></button>   Chat room </>;
              case 'Friends':
                return <><button className='Hbtn fr' onClick={() => { handleClick('ChatRoom') }}>Back <Icon.ArrowReturnLeft /></button>   Friends </>
              default:
                return null
            }
          })() : '  Sign in  '}
          <SignOut />
        </div>
      </header>
      <section>
          {user && (
            <>
              {screen === 'ChatRoom' && <ChatRoom handleClick={handleClick} />}
              {screen === 'Friends' && <Friends handleClick={handleClick} />}
            </>
          )}
          {!user && <SignIn />}
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
  const [isSignInHidden, setSignInHidden] = useState(true);
  //-----------------------------------------------------------------
  //Grazina logotipa, emailform ir mygtukus prisijungimui
  return (
    <section>
      <img alt='' className="App-logo" src={logo} />
      <>Sign in using</>
      <div className={`hidden${isSignInHidden}`} id="firebaseui-auth-container"></div>
      <div>
        <button className="Login-btn" onClick={() => { setSignInHidden(s => !s); signInWithEmail(); }}>Email <Icon.EnvelopeFill /></button>
        <button className="Login-btn" onClick={signInAnonymous}>Guest <Icon.PersonFill /></button>
      </div>
      <div>
        <button className="Login-btn" onClick={signInWithGoogle}>Google <Icon.Google /></button>
        <button className="Login-btn" onClick={signInWithGithub}>Github <Icon.Github /></button>
      </div>
    </section >
  );
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
  const query = messagesRef.orderBy('createdAt').limitToLast(2);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  if (auth.currentUser.photoURL == null)
    updateProfile(auth.currentUser, {
      photoURL: makePhoto(10)
    });
  if (auth.currentUser.displayName == null)
    updateProfile(auth.currentUser, {
      displayName: generateName()
    });
  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;

    const formValueClean = filter.clean(formValue);
    
    await messagesRef.add({
      text: formValueClean,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName,
      uid,
      photoURL
    })
    setFormValue('');
  }

  //upload image
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const storageRef = storage.ref(`images/${file.name}`);
    const task = storageRef.put(file);
    await task.then(() => {
      storageRef.getDownloadURL().then(url => {
        const { uid, photoURL, displayName } = auth.currentUser;
        messagesRef.add({
          text: url,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          displayName,
          uid,
          photoURL
        })
        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
      })
    })
  }
  return (<>
    <div>
      <div>
        <main className='main-chat'>
          <br />
          <b><Icon.ChatSquareDots size={160} /></b><br />
          <b>Say hello! 👋</b><br />
          {messages && messages.map(msg => <ChatMessage message={msg} key={msg.id} />)}
          <span ref={dummy}></span>
        </main>


        <form className='formMSG' onSubmit={sendMessage}>
          <input className='formMSGinput' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message text..." required />
          <button className='Hbtn snd formMSGbutton' type="submit" disabled={!formValue}><Icon.Send /></button>
          <input type="file" accept="image/*" id="upload" hidden onChange={uploadImage} />
          <label className='Hbtn upl formMSGbutton' htmlFor="upload"><Icon.Upload /></label>
        </form>

      </div>
    </div>
  </>)
}

//Zinutes burbuliukas
function ChatMessage(props) {
  const [isFriends, setFriend] = useState('');
  const { text, uid, photoURL, displayName } = props.message;
  //tikrinsim ar draugas
  firestore.collection('friends' + auth.currentUser.uid).doc(uid).get().then(
    doc => {
      if (doc.exists) {
        setFriend('myFriend')
      }
    });

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (<li className='messageBox'>
    <b className={`message ${messageClass} wrap`}>{displayName ? displayName : "UserWithoutName"}</b>
    <div className={`message ${messageClass}`}>
      <img alt=':(' onClick={() => AddFriend(auth.currentUser.uid, uid, displayName, photoURL) & setFriend('myFriend')} className={`Profile-img ${isFriends} name`} src={
        photoURL ? photoURL : "https://icon-library.com/images/anonymous-icon/anonymous-icon-0.jpg"} />
      <p>
        {text.includes('/images%') ? <img alt=':(' className='message-img' src={text} /> : <Linkify properties={{ target: '_blank', style: { color: 'blue' } }}>{text}</Linkify>}
      </p>

    </div>
  </li>
  )
}

//-----------------------------------------------------------------------DRAUGAI
//Draugu langas
function Friends(props) {
  const friendsRef = firestore.collection('friends' + auth.currentUser.uid);
  const query = friendsRef.orderBy('createdAt');
  const [friends] = useCollectionData(query, { idField: 'id' });
  return (<>
    <div>
      <div>
        <main className='FriendBoxBox'>
          <b className='FriendBox' onClick={() => { pokalbis = "messages"; props.handleClick('ChatRoom') }}>Public</b>
          {friends && friends.map(fr => <FriendBox key={fr.id} friend={fr} handleClick={props.handleClick} />)}
        </main>
      </div>
    </div>
  </>)
}

//Draugo burbuliukas
function FriendBox(props) {
  const { uid, displayName, photoURL } = props.friend;
  return (
    <div>
      <div className='FriendBox'>
        <div onClick={() => { PakeistiPokalbi(uid); props.handleClick('ChatRoom') }} >
          <img alt=':(' className='Profile-imgFR name' src={
            photoURL ? photoURL : "https://icon-library.com/images/anonymous-icon/anonymous-icon-0.jpg"} />
          <b>{displayName ? displayName : "UserWithoutName"}</b>
        </div>
        <div>
          <button className='rmvFriend' onClick={() => { RemoveFriend(props.friend) }}><Icon.XCircle /></button>
        </div>
      </div>
    </div>
  )
}

//Pašalinti drauga
const RemoveFriend = (friend) => {
  const friendsRefSau = firestore.collection('friends' + auth.currentUser.uid).doc(friend.uid);
  const friendsRefKitam = firestore.collection('friends' + friend.uid).doc(auth.currentUser.uid);
  friendsRefSau.delete();
  friendsRefKitam.delete();
  pokalbis = "messages";
}

//Prideti drauga
const AddFriend = (userId, uid, displayName, photoURL) => {
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
    photoURL: auth.currentUser.photoURL,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

//Pakeisti pokalbi
function PakeistiPokalbi(draugoId) {
  if (draugoId.localeCompare(auth.currentUser.uid) > 0) {
    pokalbis = auth.currentUser.uid + "messages" + draugoId;
  }
  else {
    pokalbis = draugoId + "messages" + auth.currentUser.uid;
  }
}



export default App;