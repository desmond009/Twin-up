import { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import FeedbackModal from '../components/FeedbackModal';

const TABS = [
  { key: 'pending', label: 'Pending Requests' },
  { key: 'current', label: 'Current Swaps' },
  { key: 'history', label: 'History' },
];

// Mock swap data
const mockSwaps = {
  pending: [
    {
      id: 1,
      user: { name: 'Alice Smith', avatar: '', location: 'New York' },
      skill: 'Excel',
      status: 'pending',
      sent: true,
    },
    {
      id: 2,
      user: { name: 'Bob Lee', avatar: '', location: 'San Francisco' },
      skill: 'Photoshop',
      status: 'pending',
      sent: false,
    },
  ],
  current: [
    {
      id: 3,
      user: { name: 'Carla Gomez', avatar: '', location: 'Austin' },
      skill: 'Public Speaking',
      status: 'accepted',
      started: '2024-07-01',
    },
  ],
  history: [
    {
      id: 4,
      user: { name: 'Alice Smith', avatar: '', location: 'New York' },
      skill: 'Excel',
      status: 'completed',
      completed: '2024-06-20',
      feedbackGiven: false,
    },
    {
      id: 5,
      user: { name: 'Bob Lee', avatar: '', location: 'San Francisco' },
      skill: 'Photoshop',
      status: 'rejected',
      completed: '2024-06-10',
    },
  ],
};

export default function Swaps() {
  const [tab, setTab] = useState('pending');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);

  const handleAction = (swapId, action) => {
    if (action === 'feedback') {
      const swap = mockSwaps.history.find((s) => s.id === swapId);
      setSelectedSwap(swap);
      setFeedbackOpen(true);
      return;
    }
    // Placeholder for accept/reject/delete logic
    alert(`Action: ${action} on swap #${swapId}`);
  };

  const handleFeedbackSubmit = (data) => {
    setFeedbackOpen(false);
    setSelectedSwap(null);
    alert(`Feedback submitted! Rating: ${data.rating}, Comment: ${data.comment}`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="flex gap-2 mb-6 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {mockSwaps[tab].length === 0 && (
          <div className="text-center text-gray-500 py-8">No {TABS.find((t) => t.key === tab).label.toLowerCase()}.</div>
        )}
        <ul className="space-y-4">
          {mockSwaps[tab].map((swap) => (
            <li key={swap.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              {swap.user.avatar ? (
                <img src={swap.user.avatar} alt={swap.user.name} className="w-12 h-12 rounded-full object-cover border" />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-300" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{swap.user.name}</div>
                <div className="text-gray-500 text-sm">{swap.user.location}</div>
                <div className="text-sm mt-1">
                  <span className="font-medium text-gray-600">Skill:</span> {swap.skill}
                </div>
                {tab === 'current' && (
                  <div className="text-xs text-gray-400 mt-1">Started: {swap.started}</div>
                )}
                {tab === 'history' && (
                  <div className="text-xs text-gray-400 mt-1">{swap.status === 'completed' ? `Completed: ${swap.completed}` : `Rejected: ${swap.completed}`}</div>
                )}
              </div>
              {tab === 'pending' && (
                <div className="flex flex-col gap-2">
                  {swap.sent ? (
                    <button
                      onClick={() => handleAction(swap.id, 'delete')}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Delete
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(swap.id, 'accept')}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(swap.id, 'reject')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}
              {tab === 'history' && swap.status === 'completed' && !swap.feedbackGiven && (
                <button
                  onClick={() => handleAction(swap.id, 'feedback')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Leave Feedback
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
        user={selectedSwap?.user}
        skill={selectedSwap?.skill}
      />
    </div>
  );
}
