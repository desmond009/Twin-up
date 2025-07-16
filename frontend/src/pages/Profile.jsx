import { useState, useEffect } from 'react';
import { UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/users/search', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setUsers(res.data.data.users || []);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  const handleEdit = (u) => {
    setEditUser(u);
    setEditing(true);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">All Users</h2>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading users...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((u) => (
            <div key={u.id || u._id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 relative group">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <UserCircleIcon className="w-12 h-12 text-gray-300" />
                  {u.id === user?.id || u._id === user?.id ? (
                    <button
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Edit your profile"
                      onClick={() => handleEdit(u)}
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
                <div>
                  <div className="font-semibold text-lg">{u.name}</div>
                  <div className="text-gray-500 text-sm">{u.location}</div>
                </div>
              </div>
              <div className="text-gray-700 text-sm mb-1">{u.bio}</div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="font-medium text-gray-600">Offers:</span>
                {(u.skillsOffered || []).map((skill, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="font-medium text-gray-600">Wants:</span>
                {(u.skillsWanted || []).map((skill, i) => (
                  <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit modal or drawer can go here if editing is true */}
      {editing && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setEditing(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            {/* Form fields for editing user info (name, location, skills, etc.) can go here */}
            <div className="text-gray-600">(Editing UI coming soon...)</div>
          </div>
        </div>
      )}
    </div>
  );
}
