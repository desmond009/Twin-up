import { useState } from 'react';
import SwapTable from '../components/admin/SwapTable';
import UserTable from '../components/admin/UserTable';
import SkillModeration from '../components/admin/SkillModeration';
import PlatformMessage from '../components/admin/PlatformMessage';
import ReportDownload from '../components/admin/ReportDownload';

const TABS = [
  { key: 'swaps', label: 'Swap Requests' },
  { key: 'users', label: 'Users' },
  { key: 'skills', label: 'Skills' },
  { key: 'messages', label: 'Messages' },
  { key: 'reports', label: 'Reports' },
];

export default function Admin() {
  const [tab, setTab] = useState('swaps');

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
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
      <div className="bg-white rounded-xl shadow p-6">
        {tab === 'swaps' && <SwapTable />}
        {tab === 'users' && <UserTable />}
        {tab === 'skills' && <SkillModeration />}
        {tab === 'messages' && <PlatformMessage />}
        {tab === 'reports' && <ReportDownload />}
      </div>
    </div>
  );
}
