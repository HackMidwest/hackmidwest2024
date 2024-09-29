import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Generate from './components/Generate/Generate';
import LandingPage from './components/routes/LandingPage';
import SimpleAppBar from './components/SimpleAppBar/SimpleAppBar';
import MindMap from './components/MindMap/MindMap';
import QnAPage from './components/QnAPage/QnAPage';
import Quiz from './components/Quiz/Quiz';

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
        <Route path="/mindmap" element={<MindMap />} />"
        <Route path="/qnapage" element={<QnAPage />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;
