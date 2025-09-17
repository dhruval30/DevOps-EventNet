import { AnimatePresence, motion } from "framer-motion";
import { useState } from 'react';

export default function OtpVerification({ email, onVerificationSuccess }) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired OTP.");
      }

      // Pass the user data to the parent component to trigger a state change
      if (onVerificationSuccess) {
        onVerificationSuccess(data.user);
      }

    } catch (err) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(0, 0, 0, 0.9)" }}
      >
        <motion.div
          className="relative z-10 w-full max-w-xl rounded-3xl bg-neutral-950 p-6 sm:p-8 shadow-2xl"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="flex flex-col items-start relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mb-6">
              Verify Your Email
            </h2>
            <p className="text-sm text-neutral-400 mb-4">
              We have sent a 6-digit code to **{email}**. Please enter it below to verify your account.
            </p>

            {error && (
              <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="text-xs uppercase font-medium text-neutral-500 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl px-6 py-4 font-bold text-neutral-900 transition-colors duration-300 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-neutral-100 hover:bg-neutral-300'}`}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}