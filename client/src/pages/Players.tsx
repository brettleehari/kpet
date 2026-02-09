import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import PlayerForm from '../components/PlayerForm';

interface Player {
  id: string;
  name: string;
  whatsapp: string;
  role: string;
  location: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'All-Rounder',
  WICKET_KEEPER: 'Wicket Keeper',
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      const data = await api.get<Player[]>('/players');
      setPlayers(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreate(data: { name: string; whatsapp: string; role: string; location: string }) {
    try {
      await api.post('/players', data);
      setShowForm(false);
      loadPlayers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdate(data: { name: string; whatsapp: string; role: string; location: string }) {
    if (!editingPlayer) return;
    try {
      await api.put(`/players/${editingPlayer.id}`, data);
      setEditingPlayer(null);
      loadPlayers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this player?')) return;
    try {
      await api.patch(`/players/${id}/deactivate`);
      loadPlayers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await api.post<{ imported: number }>('/players/import', formData);
      setImportMsg(`Imported ${data.imported} players`);
      fileRef.current!.value = '';
      loadPlayers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Players</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(true); setEditingPlayer(null); }}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Add Player
          </button>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileRef}
              accept=".csv"
              className="text-sm"
            />
            <button
              onClick={handleImport}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Import CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}
      {importMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{importMsg}</div>
      )}

      {(showForm || editingPlayer) && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">
            {editingPlayer ? 'Edit Player' : 'Add Player'}
          </h2>
          <PlayerForm
            initial={editingPlayer || undefined}
            onSubmit={editingPlayer ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingPlayer(null); }}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">WhatsApp</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{player.name}</td>
                <td className="py-3 px-4 text-gray-600">{player.whatsapp}</td>
                <td className="py-3 px-4">{ROLE_LABELS[player.role] || player.role}</td>
                <td className="py-3 px-4 text-gray-600">{player.location}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => { setEditingPlayer(player); setShowForm(false); }}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(player.id)}
                    className="text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No players yet. Add your first player above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
