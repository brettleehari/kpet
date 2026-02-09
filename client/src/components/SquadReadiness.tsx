interface Props {
  readiness: 'READY' | 'AT_RISK' | 'NOT_READY';
  available: number;
  required: number;
}

const STYLES: Record<string, string> = {
  READY: 'bg-green-100 text-green-800 border-green-300',
  AT_RISK: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  NOT_READY: 'bg-red-100 text-red-800 border-red-300',
};

const LABELS: Record<string, string> = {
  READY: 'Ready',
  AT_RISK: 'At Risk',
  NOT_READY: 'Not Ready',
};

export default function SquadReadiness({ readiness, available, required }: Props) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium ${STYLES[readiness]}`}>
      <span>{LABELS[readiness]}</span>
      <span className="text-xs opacity-75">({available}/{required})</span>
    </div>
  );
}
