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
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useRef, useState } from 'react';
import React from 'react';

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
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <header className="bg-white shadow-sm px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight">Twin-up</Link>
        <nav className="flex gap-4 text-gray-700 font-medium text-base items-center">
          <Link to="/profile" className="hover:text-blue-600 transition">Profile</Link>
          <Link to="/search" className="hover:text-blue-600 transition">Search</Link>
          <Link to="/swaps" className="hover:text-blue-600 transition">Swaps</Link>
          <Link to="/admin" className="hover:text-blue-600 transition">Admin</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="ml-4 px-4 py-1.5 rounded-lg font-semibold border border-blue-600 text-blue-600 hover:bg-blue-50 transition">Register</Link>
              <Link to="/login" className="px-4 py-1.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">Login</Link>
            </>
          ) : (
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 focus:outline-none"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="User menu"
              >
                <UserCircleIcon className="w-8 h-8 text-blue-600" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-2 text-gray-700 text-sm border-b">{user?.name || 'User'}</div>
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 text-sm rounded-b-lg"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
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
