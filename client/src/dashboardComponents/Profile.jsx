import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Profile({ user, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    status: '',
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        status: user.status || 'Available for networking',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setSuccessMessage('');
    setErrorMessage('');
    // Reset form data to the original user prop values
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      status: user.status || 'Available for networking',
      bio: user.bio || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only submit if we're actually editing
    if (!isEditing) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`http://localhost:3000/api/auth/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            linkedin: formData.linkedin,
            github: formData.github,
            status: formData.status,
            bio: formData.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      setSuccessMessage(data.message);
      setIsEditing(false);
      
      if (onProfileUpdate) {
          onProfileUpdate(data.user);
      }
      
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Your Profile</h2>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors text-sm"
            >
              Change Photo
            </button>
          </div>
          
          <div className="flex-1 space-y-6">
            {successMessage && (
                <div className="w-full p-3 mb-4 text-sm text-green-500 bg-green-900/50 rounded-lg">
                  {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-900/50 rounded-lg">
                  {errorMessage}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 ${isEditing ? 'bg-gray-800' : 'bg-gray-900 cursor-not-allowed'}`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 ${isEditing ? 'bg-gray-800' : 'bg-gray-900 cursor-not-allowed'}`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 ${isEditing ? 'bg-gray-800' : 'bg-gray-900 cursor-not-allowed'}`}
                    disabled={!isEditing}
                  >
                    <option>Available for networking</option>
                    <option>Busy</option>
                    <option>Away</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 ${isEditing ? 'bg-gray-800' : 'bg-gray-900 cursor-not-allowed'}`}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 ${isEditing ? 'bg-gray-800' : 'bg-gray-900 cursor-not-allowed'}`}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  rows={4}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell others about yourself and your professional interests..."
                  className={`w-full px-4 py-2 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 resize-none ${isEditing ? 'bg-gray-800' : 'bg-gray-900 cursor-not-allowed'}`}
                  readOnly={!isEditing}
                ></textarea>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelClick}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button 
              type="button" 
              onClick={handleEditClick}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}