import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Generate from './components/Generate/Generate';
import LandingPage from './components/routes/LandingPage';
import SimpleAppBar from './components/SimpleAppBar/SimpleAppBar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/simpleappbar" element={<SimpleAppBar />} />
      </Routes>
    </Router>
  );
}

export default App;
