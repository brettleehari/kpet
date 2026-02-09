import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import EventForm from '../components/EventForm';

interface EventData {
  id: string;
  type: string;
  opponent: string | null;
  venue: string;
  dateTime: string;
  requiredPlayers: number;
  poll: {
    responses: { response: string }[];
  } | null;
}

export default function Events() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await api.get<EventData[]>('/events');
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreate(data: {
    type: string;
    opponent: string;
    venue: string;
    dateTime: string;
    requiredPlayers: number;
  }) {
    try {
      await api.post('/events', data);
      setShowForm(false);
      loadEvents();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      loadEvents();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function getReadiness(event: EventData): { label: string; style: string } {
    if (!event.poll) return { label: 'No Poll', style: 'bg-gray-100 text-gray-600' };
    const available = event.poll.responses.filter((r) => r.response === 'AVAILABLE').length;
    const maybe = event.poll.responses.filter((r) => r.response === 'MAYBE').length;
    if (available >= event.requiredPlayers) return { label: 'Ready', style: 'bg-green-100 text-green-800' };
    if (available + maybe >= event.requiredPlayers - 2) return { label: 'At Risk', style: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Not Ready', style: 'bg-red-100 text-red-800' };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
        >
          Create Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">New Event</h2>
          <EventForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => {
          const readiness = getReadiness(event);
          const date = new Date(event.dateTime);
          const isPast = date < new Date();
          return (
            <div
              key={event.id}
              className={`bg-white rounded-lg shadow p-4 ${isPast ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    to={`/events/${event.id}`}
                    className="text-lg font-semibold text-green-700 hover:underline"
                  >
                    {event.type === 'MATCH' ? `Match vs ${event.opponent || 'TBD'}` : 'Training'}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    | {event.venue}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${readiness.style}`}>
                    {readiness.label}
                  </span>
                  {event.poll && (
                    <span className="text-xs text-gray-500">
                      {event.poll.responses.filter((r) => r.response === 'AVAILABLE').length}/
                      {event.requiredPlayers} available
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No events yet. Create your first event above.
          </div>
        )}
      </div>
    </div>
  );
}
