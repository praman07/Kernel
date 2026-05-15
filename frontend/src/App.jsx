import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CreateProject from './pages/CreateProject';
import CreateBlog from './pages/CreateBlog';
import ProjectDetails from './pages/ProjectDetails';
import BlogDetails from './pages/BlogDetails';
import Notifications from './pages/Notifications';
import Bookmarks from './pages/Bookmarks';
import Onboarding from './pages/Onboarding';
import EditProject from './pages/EditProject';
import EditBlog from './pages/EditBlog';
import Messages from './pages/Messages';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/feed" /> : <Home />} />
          <Route path="/login" element={user ? <Navigate to="/feed" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/feed" /> : <Signup />} />
          
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/create-project" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
          <Route path="/create-blog" element={<PrivateRoute><CreateBlog /></PrivateRoute>} />
          <Route path="/project/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
          <Route path="/blog/:id" element={<PrivateRoute><BlogDetails /></PrivateRoute>} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
          <Route path="/edit-project/:id" element={<PrivateRoute><EditProject /></PrivateRoute>} />
          <Route path="/edit-blog/:id" element={<PrivateRoute><EditBlog /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
