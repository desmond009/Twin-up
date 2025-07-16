export default function SwapTable() {
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Pending</button>
        <button className="px-3 py-1 bg-green-100 text-green-700 rounded">Accepted</button>
        <button className="px-3 py-1 bg-red-100 text-red-700 rounded">Rejected</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Skill</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2">Alice Smith</td>
              <td className="px-3 py-2">Excel</td>
              <td className="px-3 py-2">Pending</td>
              <td className="px-3 py-2">2024-07-10</td>
              <td className="px-3 py-2">
                <button className="text-green-600 hover:underline mr-2">Accept</button>
                <button className="text-red-600 hover:underline">Reject</button>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Bob Lee</td>
              <td className="px-3 py-2">Photoshop</td>
              <td className="px-3 py-2">Accepted</td>
              <td className="px-3 py-2">2024-07-08</td>
              <td className="px-3 py-2">
                <button className="text-gray-600 hover:underline">View</button>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">Carla Gomez</td>
              <td className="px-3 py-2">Public Speaking</td>
              <td className="px-3 py-2">Rejected</td>
              <td className="px-3 py-2">2024-07-05</td>
              <td className="px-3 py-2">
                <button className="text-gray-600 hover:underline">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
