import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const tiles = [
  { name: 'Maintenance', color: 'from-indigo-500 to-purple-500', icon: '🏢', path: '/maintenance' },
  { name: 'Motor', color: 'from-blue-500 to-cyan-500', icon: '👥', path: '/trans-motors' },
];

const Transaction = () => {
  const navigate = useNavigate();

  const handleTileClick = (tile) => {
    if (tile.path) {
      navigate(tile.path);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Transaction</h2>
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

export default Transaction;