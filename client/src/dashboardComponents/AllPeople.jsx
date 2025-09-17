import { Search, User } from 'lucide-react';

export default function AllPeople({ users, onCardClick }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-100">All People</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all people..."
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {users.length > 0 ? (
          users.map((person) => (
            <button key={person._id} onClick={() => onCardClick(person)} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-rose-600 transition-colors text-left">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">{person.name}</h3>
                  <p className="text-sm text-gray-400">{person.status}</p>
                </div>
              </div>
              {person.bio && (
                <p className="text-xs text-gray-400 line-clamp-2">
                  {person.bio}
                </p>
              )}
            </button>
          ))
        ) : (
          <p className="text-gray-500">No other registered users found for this event.</p>
        )}
      </div>
    </div>
  );
}