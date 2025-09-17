import { Bell, Calendar, MessageCircle, Settings, TrendingUp, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AllPeople from '../dashboardComponents//AllPeople';
import AiMatches from '../dashboardComponents/AiMatches';
import Profile from '../dashboardComponents/Profile';
import UserProfilePopup from '../dashboardComponents/UserProfilePopup';

export default function Dashboard({ user, onLogout, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('matches');
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchAttendees = async () => {
      // Check if user and event ID are valid before making the API call
      if (!user || !user.event || !user._id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);

      try {
        const fetchUrl = `http://localhost:3000/api/auth/events/${user.event}/users`;
        const response = await fetch(fetchUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch attendees. Status: ' + response.status);
        }
        const data = await response.json();
        
        // Filter out the current logged-in user
        const otherAttendees = data.filter(attendee => attendee.email.toLowerCase() !== user.email.toLowerCase());
        setAttendees(otherAttendees);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, [user._id, user.event, user.email]); // The effect now depends on these specific properties

  const stats = [
    { label: 'Profile Views', value: '127', change: '+12%', icon: TrendingUp },
    { label: 'New Matches', value: '8', change: '+3', icon: Users },
    { label: 'Messages', value: '24', change: '+5', icon: MessageCircle },
    { label: 'Events', value: '3', change: 'This month', icon: Calendar }
  ];
  
  // The matches list is a subset of all attendees for the prototype.
  const matches = attendees.slice(0, 3);
  
  const handleOpenPopup = (person) => {
      setSelectedUser(person);
  };
  
  const handleClosePopup = () => {
      setSelectedUser(null);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-rose-600">EventNet</h1>
              <span className="hidden sm:block text-sm text-gray-400">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-700">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-100">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.uniqueCode}</div>
                </div>
                <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <button 
                  onClick={onLogout}
                  className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-rose-600" />
                <span className="text-xs text-green-400">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-100 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex space-x-1 bg-gray-900 p-1 rounded-xl mb-8 overflow-x-auto">
          {[
            { id: 'matches', label: 'AI Matches', icon: Users },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'allPeople', label: 'All People', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'matches' && <AiMatches matches={matches} />}
        {activeTab === 'profile' && <Profile user={user} onProfileUpdate={onProfileUpdate} />}
        {activeTab === 'allPeople' && <AllPeople users={attendees} onCardClick={handleOpenPopup} />}
      </div>
      
      {selectedUser && (
        <UserProfilePopup user={selectedUser} onClose={handleClosePopup} />
      )}
    </div>
  );
}