import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const team = JSON.parse(localStorage.getItem('team') || '{}');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('team');
    navigate('/login');
  }

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/players', label: 'Players' },
    { path: '/events', label: 'Events' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">KPET</Link>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm hover:text-green-200 ${
                  location.pathname === item.path ? 'text-white font-semibold' : 'text-green-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-200">{team.name}</span>
            <button
              onClick={logout}
              className="text-sm bg-green-800 hover:bg-green-900 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
