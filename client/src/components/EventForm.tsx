import { useState, FormEvent } from 'react';

interface EventFormProps {
  onSubmit: (data: {
    type: string;
    opponent: string;
    venue: string;
    dateTime: string;
    requiredPlayers: number;
  }) => void;
  onCancel: () => void;
}

export default function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const [type, setType] = useState('MATCH');
  const [opponent, setOpponent] = useState('');
  const [venue, setVenue] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [requiredPlayers, setRequiredPlayers] = useState(11);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ type, opponent, venue, dateTime, requiredPlayers });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="MATCH">Match</option>
            <option value="TRAINING">Training</option>
          </select>
        </div>
        {type === 'MATCH' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Players</label>
          <input
            type="number"
            value={requiredPlayers}
            onChange={(e) => setRequiredPlayers(Number(e.target.value))}
            min={1}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
        >
          Create Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
