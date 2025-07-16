import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useLocation,
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

function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-500 via-green-400 to-blue-600 shadow-md px-4 py-3 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-center relative">
        <nav className="flex gap-6 text-white font-medium text-lg">
          <Link to="/profile" className="hover:text-yellow-200 transition">Profile</Link>
          <Link to="/search" className="hover:text-yellow-200 transition">Search</Link>
          <Link to="/swaps" className="hover:text-yellow-200 transition">Swaps</Link>
          <Link to="/admin" className="hover:text-yellow-200 transition">Admin</Link>
        </nav>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
          <Link to="/register" className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-semibold shadow hover:bg-blue-50 transition">Register</Link>
          <Link to="/login" className="bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:bg-blue-800 transition">Login</Link>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
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
