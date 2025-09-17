import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';


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

const fieldsPart1 = [
  { name: "uniqueCode", placeholder: "Unique Code (from the organizer)", type: "text", required: false }, // Change this line
  { name: "name", placeholder: "Full Name", type: "text" },
  { name: "email", placeholder: "Email Address", type: "email" },
  { name: "password", placeholder: "Password", type: "password", pattern: "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}", title: "Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters" },
  { name: "confirmPassword", placeholder: "Confirm Password", type: "password" },
];

const fieldsPart2 = [
  { name: "phone", placeholder: "Mobile Number", type: "tel" },
  { name: "linkedin", placeholder: "LinkedIn URL", type: "text", pattern: "https?://(www\\.)?linkedin\\.com/.*", title: "Please enter a valid LinkedIn URL (e.g., https://www.linkedin.com/in/username)" },
  { name: "github", placeholder: "GitHub URL", type: "text", pattern: "https?://(www\\.)?github\\.com/.*", title: "Please enter a valid GitHub URL (e.g., https://github.com/username)" },
  // { name: "bio", placeholder: "Bio (optional: interests, what you do)", type: "textarea" },
];

export default function JoinEvent({ isOpen, onClose, csrfToken, onRegistrationSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    uniqueCode: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    linkedin: "",
    github: "",
    eventId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Fetch list of events when the modal opens
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/events");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch events.");
        }
        setEvents(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, eventId: data[0]._id }));
        }
      } catch (err) {
        setEventsError(err.message || "Could not fetch events.");
      } finally {
        setIsEventsLoading(false);
      }
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      phone: value,
    }));
  };

  const handleNext = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setStep(2);
    setError(null);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    console.log("Submitting the following data:");
    console.log("Name:", formData.name);
    console.log("Email:", formData.email);
    console.log("Unique Code:", formData.uniqueCode);
    console.log("Event ID:", formData.eventId);
    console.log("Password:", "********"); // Do not log the actual password
    console.log("Phone:", formData.phone);
    console.log("LinkedIn:", formData.linkedin);
    console.log("GitHub:", formData.github);
    console.log("X-CSRF-Token:", csrfToken);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!csrfToken) {
      setError("CSRF token not available. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          uniqueCode: formData.uniqueCode,
          eventId: formData.eventId,
          phone: formData.phone,
          linkedin: formData.linkedin,
          github: formData.github,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setSuccessMessage(data.message);
      onRegistrationSuccess(formData.email);

    } catch (err) {
      setError(err.message || "Failed to submit form.");
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
          style={{
            background: "rgba(0, 0, 0, 0.9)"
          }}
        >
          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full max-w-xl rounded-3xl bg-neutral-950 p-6 sm:p-8 shadow-2xl"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* ... (background and close button) ... */}
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-neutral-800/20 rounded-3xl" style={{ clipPath: 'polygon(100% 0, 100% 40%, 60% 100%, 0% 100%, 0 60%, 40% 0)' }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-neutral-800/20 rounded-3xl" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 40%, 60% 0, 0 0)' }}></div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white z-20"
            >
              <IconX className="h-5 w-5" />
            </button>

            {/* Form Content */}
            <div className="flex flex-col items-start relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mb-6 sm:mb-8">Join EventNet</h2>

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

              {isEventsLoading ? (
                <p className="w-full p-4 text-center text-neutral-400">Loading events...</p>
              ) : eventsError ? (
                <div className="w-full p-3 text-sm text-red-500 bg-red-900/50 rounded-lg">
                  {eventsError}
                </div>
              ) : (
                <form className="w-full space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full space-y-4 sm:space-y-6"
                      >
                        {/* NEW: Event Selection Dropdown */}
                        <div className="flex flex-col">
                            <label className="text-xs uppercase font-medium text-neutral-500 mb-1">
                                Event
                            </label>
                            <select
                                name="eventId"
                                value={formData.eventId}
                                onChange={handleChange}
                                className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                required
                            >
                                {events.map(event => (
                                    <option key={event._id} value={event._id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* END NEW */}
                        {fieldsPart1.map((field, idx) => (
                          <motion.div
                            key={field.name}
                            className="flex flex-col"
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            custom={idx}
                          >
                            <label className="text-xs uppercase font-medium text-neutral-500 mb-1">
                              {field.placeholder.split(' ')[0]}
                            </label>
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                              className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                              required
                              pattern={field.pattern}
                              title={field.title}
                            />
                          </motion.div>
                        ))}
                        <motion.button
                          type="button"
                          onClick={handleNext}
                          className="w-full rounded-xl bg-neutral-100 px-6 py-4 font-bold text-neutral-900 transition-colors duration-300 hover:bg-neutral-300 mt-6"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          Next
                        </motion.button>
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full space-y-4 sm:space-y-6"
                      >
                        {fieldsPart2.map((field, idx) => (
                          <motion.div
                            key={field.name}
                            className="flex flex-col"
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            custom={idx}
                          >
                            <label className="text-xs uppercase font-medium text-neutral-500 mb-1">
                              {field.placeholder.split(' ')[0]}
                            </label>
                            {field.name === 'phone' ? (
                              <PhoneInput
                              name={field.name}
                              placeholder={field.placeholder}
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              defaultCountry="US"
                              className="PhoneInput"
                              required
                            />
                            ) : field.type === "textarea" ? (
                              <textarea
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                rows="4"
                                className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                required={field.name !== 'bio'}
                              />
                            ) : (
                              <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                className="w-full rounded-xl bg-neutral-800/80 px-4 py-3 text-neutral-100 placeholder-neutral-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                                required
                                pattern={field.pattern}
                                title={field.title}
                              />
                            )}
                          </motion.div>
                        ))}
                        <div className="flex justify-between items-center space-x-4 mt-6">
                          <motion.button
                            type="button"
                            onClick={handleBack}
                            className="w-full rounded-xl bg-neutral-800 px-6 py-4 font-bold text-neutral-400 transition-colors duration-300 hover:bg-neutral-700"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            Back
                          </motion.button>
                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full rounded-xl px-6 py-4 font-bold text-neutral-900 transition-colors duration-300 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-neutral-100 hover:bg-neutral-300'}`}
                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                            whileTap={{ scale: isLoading ? 1 : 0.99 }}
                          >
                            {isLoading ? "Submitting..." : "Join"}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}