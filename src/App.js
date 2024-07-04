import './App.css';
import Navbar from './components/Navbar/Navbar';
import Router from './router/router';
import { RouterProvider } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Navbar />
      <RouterProvider router={Router} />
    </div>
  );
}

export default App;
