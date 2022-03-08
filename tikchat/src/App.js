import './App.css';
import logo from './logo.svg';
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
      <img alt='' className="App-logo" src={logo}/>
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
function ChatRoom(){

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const signOut = () => {
    return auth.currentUser && (
        <button onClick={() => auth.signOut()}>Sign Out</button>
    );
  }

  return(
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <button onClick={() => auth.signOut()}>Sign Out</button>
      </div>
      <div>
        
      </div>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  
  return <p>{text}</p>
}

export default App;