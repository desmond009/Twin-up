export default function SkillModeration() {
  return (
    <div>
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <span className="flex-1">"Hacking"</span>
          <button className="px-3 py-1 bg-red-100 text-red-700 rounded">Reject</button>
        </li>
        <li className="flex items-center gap-2">
          <span className="flex-1">"Photoshop"</span>
          <button className="px-3 py-1 bg-red-100 text-red-700 rounded">Reject</button>
        </li>
        <li className="flex items-center gap-2">
          <span className="flex-1">"Excel"</span>
          <button className="px-3 py-1 bg-red-100 text-red-700 rounded">Reject</button>
        </li>
      </ul>
    </div>
  );
}
