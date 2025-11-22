import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const tiles = [
  { name: 'Department', color: 'from-indigo-500 to-purple-500', icon: '🏢', path: '/department' },
  { name: 'Group', color: 'from-blue-500 to-cyan-500', icon: '👥', path: '/group' },
  { name: 'Make', color: 'from-green-500 to-teal-500', icon: '🏭', path: '/make' },
  { name: 'Machines', color: 'from-yellow-500 to-orange-500', icon: '🛠️', path: '/machines'},
  { name: 'Schedule', color: 'from-pink-500 to-red-500', icon: '📅', path: '/schedule' },
  { name: 'Work Type', color: 'from-fuchsia-500 to-violet-500', icon: '📝', path: '/worktype' },
  { name: 'Initial Schedule Allocation', color: 'from-sky-500 to-blue-400', icon: '🚦', path: '/schedule-allocation' },
];

const Masters = () => {
  const navigate = useNavigate();

  const handleTileClick = (tile) => {
    if (tile.path) {
      navigate(tile.path);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Masters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {tiles.map((tile) => (
            <div
              key={tile.name}
              className={`flex flex-col items-center justify-center rounded-xl shadow-lg bg-gradient-to-br ${tile.color} text-white p-8 transition-transform hover:scale-105 cursor-pointer`}
              onClick={() => handleTileClick(tile)}
            >
              <div className="text-5xl mb-4">{tile.icon}</div>
              <div className="text-xl font-semibold">{tile.name}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Masters;