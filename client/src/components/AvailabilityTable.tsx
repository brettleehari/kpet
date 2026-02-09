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

interface Props {
  responses: PollResponse[];
}

const ROLE_LABELS: Record<string, string> = {
  BATSMAN: 'Bat',
  BOWLER: 'Bowl',
  ALL_ROUNDER: 'AR',
  WICKET_KEEPER: 'WK',
};

const RESPONSE_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  NOT_AVAILABLE: 'bg-red-100 text-red-800',
  MAYBE: 'bg-yellow-100 text-yellow-800',
};

const RESPONSE_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  NOT_AVAILABLE: 'Not Available',
  MAYBE: 'Maybe',
};

export default function AvailabilityTable({ responses }: Props) {
  if (responses.length === 0) {
    return <p className="text-gray-500 text-sm">No responses yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="py-2 px-3">Player</th>
          <th className="py-2 px-3">Role</th>
          <th className="py-2 px-3">Response</th>
        </tr>
      </thead>
      <tbody>
        {responses.map((r) => (
          <tr key={r.id} className="border-b">
            <td className="py-2 px-3">{r.player.name}</td>
            <td className="py-2 px-3 text-gray-600">{ROLE_LABELS[r.player.role] || r.player.role}</td>
            <td className="py-2 px-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${RESPONSE_STYLES[r.response]}`}>
                {RESPONSE_LABELS[r.response]}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
