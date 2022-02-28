import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        
        <img src={logo} className="App-logo" alt="logo" />

        <button onclick="LoginMenu()">
          <text>LOG-IN</text>
        </button>
        <p>
          Log in screen
        </p>
      </header>
    </div>
  );
}
function LoginMenu(){
    
}

export default App;
