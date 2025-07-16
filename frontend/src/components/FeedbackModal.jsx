import { useState } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/solid';

export default function FeedbackModal({ open, onClose, onSubmit, user, skill }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-2">Leave Feedback</h3>
        <div className="mb-2 text-gray-700">
          For <span className="font-semibold">{user?.name}</span> on <span className="font-semibold">{skill}</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none"
              >
                <StarIcon
                  className={`w-7 h-7 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <textarea
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            rows={3}
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
