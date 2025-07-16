import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Swaps from './pages/Swaps';
import Admin from './pages/Admin';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import { useAuth } from './context/AuthContext';

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-500">This page is under construction.</p>
    </div>
  );
}

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-40">Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md rounded-b-lg px-4 py-3 flex gap-4 items-center">
          <Link to="/profile" className="font-medium hover:text-blue-600">Profile</Link>
          <Link to="/search" className="font-medium hover:text-blue-600">Search</Link>
          <Link to="/swaps" className="font-medium hover:text-blue-600">Swaps</Link>
          <Link to="/admin" className="font-medium hover:text-blue-600">Admin</Link>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/swaps" element={<Swaps />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Placeholder title="404 Not Found" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
