import { useState } from 'react';

export default function PlatformMessage() {
  const [message, setMessage] = useState('');
  return (
    <form className="flex flex-col gap-3 max-w-md">
      <label className="font-medium">Send platform-wide message or alert:</label>
      <textarea
        className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        rows={3}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        onClick={() => { setMessage(''); alert('Message sent!'); }}
      >
        Send
      </button>
    </form>
  );
}
