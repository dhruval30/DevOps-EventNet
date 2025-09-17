import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [otpVerificationEmail, setOtpVerificationEmail] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleRegistrationSuccess = (email) => {
    setOtpVerificationEmail(email);
  };

  const handleVerificationSuccess = (userData) => {
    setOtpVerificationEmail(null);
    handleLogin(userData);
  };
  
  // NEW: Handler to update user state after a profile edit
  const handleProfileUpdate = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? (
              <Dashboard 
                user={user} 
                onLogout={handleLogout} 
                onProfileUpdate={handleProfileUpdate} // PASSING NEW PROP
              />
            ) : (
              <LandingPage 
                onLoginSuccess={handleLogin} 
                onRegistrationSuccess={handleRegistrationSuccess} 
                otpVerificationEmail={otpVerificationEmail}
                onVerificationSuccess={handleVerificationSuccess}
              />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;