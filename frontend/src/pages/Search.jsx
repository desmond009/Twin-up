import { useState } from 'react';
import { UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'Alice Smith',
    location: 'New York',
    avatar: '',
    skillsOffered: ['Photoshop', 'Illustrator'],
    skillsWanted: ['Excel', 'Public Speaking'],
    bio: 'Designer and creative thinker.',
  },
  {
    id: 2,
    name: 'Bob Lee',
    location: 'San Francisco',
    avatar: '',
    skillsOffered: ['Excel', 'Python'],
    skillsWanted: ['Photoshop'],
    bio: 'Data analyst and spreadsheet wizard.',
  },
  {
    id: 3,
    name: 'Carla Gomez',
    location: 'Austin',
    avatar: '',
    skillsOffered: ['Public Speaking', 'Leadership'],
    skillsWanted: ['Python', 'Illustrator'],
    bio: 'Community leader and speaker.',
  },
  // Add more mock users as needed
];

export default function Search() {
  const [query, setQuery] = useState('');

  const filteredUsers = mockUsers.filter((user) => {
    const q = query.toLowerCase();
    return (
      user.skillsOffered.some((s) => s.toLowerCase().includes(q)) ||
      user.skillsWanted.some((s) => s.toLowerCase().includes(q)) ||
      user.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by skill or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center text-gray-500">No users found.</div>
        )}
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3 mb-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-300" />
              )}
              <div>
                <div className="font-semibold text-lg">{user.name}</div>
                <div className="text-gray-500 text-sm">{user.location}</div>
              </div>
            </div>
            <div className="text-gray-700 text-sm mb-1">{user.bio}</div>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="font-medium text-gray-600">Offers:</span>
              {user.skillsOffered.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{skill}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="font-medium text-gray-600">Wants:</span>
              {user.skillsWanted.map((skill, i) => (
                <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{skill}</span>
              ))}
            </div>
            {/* Add swap request button here in the future */}
          </div>
        ))}
      </div>
    </div>
  );
}
