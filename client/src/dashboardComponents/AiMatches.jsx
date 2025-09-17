import { Search, User } from 'lucide-react';

export default function AiMatches({ matches }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-100">Your AI Matches</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search matches..."
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <div key={match._id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  {/* The status dot */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                    match.status === 'Available for networking' ? 'bg-green-500' : 'bg-gray-600'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">{match.name}</h3>
                  <p className="text-sm text-gray-400">{match.status}</p>
                  <div className="text-xs mt-1 text-gray-500 line-clamp-2">{match.bio}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-rose-600">85%</div>
                  <div className="text-xs text-gray-400">match</div>
                </div>
                <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Connect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}