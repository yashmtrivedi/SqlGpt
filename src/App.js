import logo from './logo.svg';
import { Routes, Route } from "react-router-dom"
import './App.css';
import Gpt from './gpt/gpt';
import User from './User/User';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Routes>
        {/* <Route path="/" element={ <User /> } /> */}
        <Route path="/" element={ <Gpt />} />
      </Routes>
      </header>
    </div>
  );
}

export default App;
