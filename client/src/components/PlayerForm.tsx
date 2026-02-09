import { useState, FormEvent } from 'react';

interface PlayerFormProps {
  initial?: {
    name: string;
    whatsapp: string;
    role: string;
    location: string;
  };
  onSubmit: (data: { name: string; whatsapp: string; role: string; location: string }) => void;
  onCancel: () => void;
}

const ROLES = [
  { value: 'BATSMAN', label: 'Batsman' },
  { value: 'BOWLER', label: 'Bowler' },
  { value: 'ALL_ROUNDER', label: 'All-Rounder' },
  { value: 'WICKET_KEEPER', label: 'Wicket Keeper' },
];

export default function PlayerForm({ initial, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp || '');
  const [role, setRole] = useState(initial?.role || 'BATSMAN');
  const [location, setLocation] = useState(initial?.location || '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, whatsapp, role, location });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (E.164)</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            placeholder="+1234567890"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
        >
          {initial ? 'Update' : 'Add Player'}
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
