import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import AvailabilityTable from '../components/AvailabilityTable';
import SquadReadiness from '../components/SquadReadiness';

interface PollResponse {
  id: string;
  response: 'AVAILABLE' | 'NOT_AVAILABLE' | 'MAYBE';
  player: {
    id: string;
    name: string;
    role: string;
    whatsapp: string;
  };
}

interface PollSummary {
  available: number;
  notAvailable: number;
  maybe: number;
  noResponse: number;
  totalPlayers: number;
  requiredPlayers: number;
  readiness: 'READY' | 'AT_RISK' | 'NOT_READY';
}

interface EventData {
  id: string;
  type: string;
  opponent: string | null;
  venue: string;
  dateTime: string;
  requiredPlayers: number;
  poll: {
    id: string;
    pollsSent: boolean;
    responses: PollResponse[];
  } | null;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [summary, setSummary] = useState<PollSummary | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
      loadPollSummary();
    }
  }, [id]);

  async function loadEvent() {
    try {
      const data = await api.get<EventData>(`/events/${id}`);
      setEvent(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function loadPollSummary() {
    try {
      const data = await api.get<{ poll: any; summary: PollSummary }>(`/polls/${id}`);
      setSummary(data.summary);
    } catch {
      // Poll might not exist yet
    }
  }

  async function handleSendPoll() {
    setSending(true);
    try {
      await api.post(`/polls/${id}/send`);
      loadEvent();
      loadPollSummary();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!event) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const date = new Date(event.dateTime);

  return (
    <div>
      <Link to="/events" className="text-green-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to Events
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {event.type === 'MATCH' ? `Match vs ${event.opponent || 'TBD'}` : 'Training'}
            </h1>
            <div className="text-gray-600 mt-1">
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-gray-600">Venue: {event.venue}</div>
            <div className="text-gray-600">Required: {event.requiredPlayers} players</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {summary && (
              <SquadReadiness
                readiness={summary.readiness}
                available={summary.available}
                required={summary.requiredPlayers}
              />
            )}
            <button
              onClick={handleSendPoll}
              disabled={sending}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Poll / Reminder'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.available}</div>
            <div className="text-sm text-green-600">Available</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.notAvailable}</div>
            <div className="text-sm text-red-600">Not Available</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{summary.maybe}</div>
            <div className="text-sm text-yellow-600">Maybe</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{summary.noResponse}</div>
            <div className="text-sm text-gray-600">No Response</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Responses</h2>
        <AvailabilityTable responses={event.poll?.responses || []} />
      </div>
    </div>
  );
}
