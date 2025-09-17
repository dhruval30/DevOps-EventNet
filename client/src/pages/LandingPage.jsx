import { useEffect, useState } from 'react';
import JoinEvent from '../components/JoinEvent';
import Login from '../components/Login';
import MainNavbar from "../components/Navbar";
import OtpVerification from '../components/OtpVerification';

export default function LandingPage({ onLoginSuccess }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const [verificationEmail, setVerificationEmail] = useState(null); 


  // Fetch CSRF token on page load
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/csrf-token", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        console.log("CSRF token fetched:", data.csrfToken);
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err);
      }
    };
    
    // Animate the page content
    setIsVisible(true);
    
    // Fetch the token when the component mounts
    fetchCsrfToken();
  }, []);

  const handleOpenJoinModal = () => {
    setIsJoinModalOpen(true);
    setIsLoginModalOpen(false);
  };
  const handleCloseJoinModal = () => setIsJoinModalOpen(false);
  
  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsJoinModalOpen(false);
  };
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  // This handler receives the email from the JoinEvent component
  const handleRegistrationSuccess = (email) => {
    setIsJoinModalOpen(false); // Close the JoinEvent modal
    setVerificationEmail(email); // Open the OTP modal with the user's email
  };

  const handleVerificationSuccess = (user) => {
    setVerificationEmail(null); // Close the OTP modal
    onLoginSuccess(user); // Redirect to dashboard
  };

  return (
    <div className="font-sans antialiased bg-gray-950 text-gray-100 min-h-screen">
      <MainNavbar onSignupClick={handleOpenJoinModal} onLoginClick={handleOpenLoginModal} />

      <section className="relative px-6 lg:px-12 pt-40 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className={`flex-1 transition-all duration-1000 ${isVisible? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center space-x-2 mb-6 text-gray-400">
                <span className="text-sm">Powering connections at events worldwide</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-gray-100">
                AI-powered networking that turns events into 
                <span className="bg-gradient-to-r from-rose-800 to-rose-600 bg-clip-text text-transparent"> meaningful opportunities</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                EventNet uses intelligent algorithms to connect attendees with the right people at any event. No more random networking, just meaningful conversations that matter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gray-50 text-gray-900 rounded-xl shadow-lg hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center group">
                  Get Started
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
            
            <div className={`flex-1 transition-all duration-1000 delay-300 ${isVisible? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative md:scale-100 lg:scale-105">
                <div className="bg-gray-950 rounded-3xl p-8 lg:p-12 shadow-none">
                  <div className="bg-gray-950 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-100">AI Matches</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-200">test test</div>
                          <div className="text-sm text-gray-400">AI/ML Engineer • 95% match</div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-200">test test</div>
                          <div className="text-sm text-gray-400">Product Manager • 88% match</div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-200">test test</div>
                          <div className="text-sm text-gray-400">Startup Founder • 82% match</div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='features' className="px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-100 mb-6">
              A smarter way to network
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              EventNet is designed to make every interaction valuable, from the moment you register to the final handshake.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-100">Pre-Event Setup</h3>
              <p className="text-gray-400 mb-6">Configure matching criteria and effortlessly import attendee data.</p>
              <button className="font-semibold text-gray-100 hover:text-rose-600 transition-colors">Learn more →</button>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-100">Live Matching</h3>
              <p className="text-gray-400 mb-6">Our real-time recommendations instantly connect attendees with their ideal matches.</p>
              <button className="font-semibold text-gray-100 hover:text-rose-600 transition-colors">Learn more →</button>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-100">Connection Analytics</h3>
              <p className="text-gray-400 mb-6">Track networking success and gather insights to improve all future events.</p>
              <button className="font-semibold text-gray-100 hover:text-rose-600 transition-colors">Learn more →</button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-100 mb-6">
              Just three steps to smarter networking
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-md">1</div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Setup Your Event</h3>
              <p className="text-gray-400">Import attendee data and configure your networking goals and criteria for optimal matching.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-md">2</div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">AI Analyzes & Matches</h3>
              <p className="text-gray-400">Our algorithms process attendee profiles to identify the most valuable potential connections.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-md">3</div>
              <h3 className="text-xl font-bold text-gray-100 mb-4">Connect & Engage</h3>
              <p className="text-gray-400">Attendees receive curated recommendations and can connect with confidence at your event.</p>
            </div>
          </div>
        </div>
      </section>

      <section id='how-it-works' className="px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-100 mb-6">
                For Attendees: Network by design, not by chance
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                No more collecting business cards from random encounters. EventNet identifies the exact people you should meet based on your goals, interests, and professional background.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-100">Curated Connections</div>
                    <div className="text-gray-400">Get a personalized list of the most relevant attendees to meet</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-100">Smart Scheduling</div>
                    <div className="text-gray-400">Coordinate meetups with your matches during optimal event times</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-100">Follow-Up Tools</div>
                    <div className="text-gray-400">Keep track of new connections and continue conversations post-event</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative md:scale-100 lg:scale-105">
                <div className="bg-gray-950 rounded-3xl p-8 lg:p-12 shadow-xl">
                  <div className="bg-gray-950 rounded-2xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-100">AI Matches</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-xl">
                        <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-200">test test</div>
                          <div className="text-sm text-gray-400">AI/ML Engineer • 95% match</div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-xl">
                        <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-200">test test</div>
                          <div className="text-sm text-gray-400">Product Manager • 88% match</div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-xl">
                        <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-200">test test</div>
                          <div className="text-sm text-gray-400">Startup Founder • 82% match</div>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">
            Ready to revolutionize event networking?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the future of intelligent event connections. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gray-50 text-gray-900 rounded-xl shadow-lg hover:bg-gray-200 transition-colors font-semibold">
              Get Started - Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-16 border-t border-gray-800">
          <div className="mt-12 pt-8 text-center border-gray-800">
            <p className="text-rose-600 text-sm">made with love, </p>
            <p className="text-gray-400 text-sm">dhruval padia</p>
            <p className="text-gray-400 text-sm">❤️</p>
          </div>
      </footer>

      {/* The new modal component is rendered here conditionally */}
      <JoinEvent 
        isOpen={isJoinModalOpen} 
        onClose={handleCloseJoinModal} 
        csrfToken={csrfToken}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      {/* NEW LOGIN MODAL */}
      <Login 
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        csrfToken={csrfToken}
        onLoginSuccess={onLoginSuccess} 
      />

      {verificationEmail && (
        <OtpVerification
          email={verificationEmail}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
}