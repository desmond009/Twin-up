export default function UserTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-2">Alice Smith</td>
            <td className="px-3 py-2">Active</td>
            <td className="px-3 py-2">
              <button className="text-red-600 hover:underline">Ban</button>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2">Bob Lee</td>
            <td className="px-3 py-2">Banned</td>
            <td className="px-3 py-2">
              <button className="text-green-600 hover:underline">Unban</button>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2">Carla Gomez</td>
            <td className="px-3 py-2">Active</td>
            <td className="px-3 py-2">
              <button className="text-red-600 hover:underline">Ban</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
