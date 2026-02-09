import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

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

export default function Dashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const team = JSON.parse(localStorage.getItem('team') || '{}');

  useEffect(() => {
    api.get<EventData[]>('/events').then(setEvents).catch(() => {});
    api.get<any[]>('/players').then((p) => setPlayerCount(p.length)).catch(() => {});
  }, []);

  const upcoming = events.filter((e) => new Date(e.dateTime) > new Date());

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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {team.name} Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-700">{upcoming.length}</div>
          <div className="text-sm text-gray-600">Upcoming Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-700">{playerCount}</div>
          <div className="text-sm text-gray-600">Active Players</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-700">
            {upcoming.filter((e) => {
              const r = getReadiness(e);
              return r.label === 'Ready';
            }).length}
          </div>
          <div className="text-sm text-gray-600">Events Ready</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Events</h2>
      <div className="space-y-3">
        {upcoming.map((event) => {
          const readiness = getReadiness(event);
          const date = new Date(event.dateTime);
          const available = event.poll?.responses.filter((r) => r.response === 'AVAILABLE').length || 0;
          const responded = event.poll?.responses.length || 0;
          return (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">
                    {event.type === 'MATCH' ? `Match vs ${event.opponent || 'TBD'}` : 'Training'}
                  </div>
                  <div className="text-sm text-gray-600">
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
                  <span className="text-xs text-gray-500">
                    {available}/{event.requiredPlayers} available | {responded} responded
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {upcoming.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No upcoming events.{' '}
            <Link to="/events" className="text-green-600 hover:underline">
              Create one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
