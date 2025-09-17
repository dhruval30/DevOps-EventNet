import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: "easeOut"
    }
  }),
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export default function Login({ isOpen, onClose, csrfToken, onLoginSuccess }) {
    const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!csrfToken) {
      setError("CSRF token not available. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setSuccessMessage(data.message);
      
      // CALL THE NEW PROP FUNCTION WITH USER DATA
      onLoginSuccess(data.user);

    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white z-20"
            >
              <IconX className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-start relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mb-6 sm:mb-8">Login to EventNet</h2>

              {error && (
                <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-900/50 rounded-lg">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="w-full p-3 mb-4 text-sm text-green-500 bg-green-900/50 rounded-lg">
                  {successMessage}
                </div>
              )}

              <form className="w-full space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                <motion.div variants={formVariants} initial="hidden" animate="visible" custom={0}>
                  <label className="text-xs uppercase font-medium text-neutral-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    required
                  />
                </motion.div>
                <motion.div variants={formVariants} initial="hidden" animate="visible" custom={1}>
                  <label className="text-xs uppercase font-medium text-neutral-500 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    required
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full rounded-xl px-6 py-4 font-bold text-neutral-900 transition-colors duration-300 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-neutral-100 hover:bg-neutral-300'}`}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}