import { IconBrandGithub, IconBrandLinkedin, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function UserProfilePopup({ user, onClose }) {
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative z-10 w-full max-w-sm rounded-3xl bg-gray-950 p-6 sm:p-8 shadow-2xl border border-gray-800 text-center"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white z-20"
          >
            <IconX className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-100 mt-6">{user.name}</h2>
            <p className="text-sm text-gray-400 mb-6">{user.email}</p>

            <div className="flex justify-center space-x-4 mt-4">
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-full text-gray-400 transition-colors hover:bg-rose-600 hover:text-white">
                  <IconBrandLinkedin size={24} />
                </a>
              )}
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-full text-gray-400 transition-colors hover:bg-rose-600 hover:text-white">
                  <IconBrandGithub size={24} />
                </a>
              )}
            </div>
            
            {user.bio && (
              <div className="mt-8 text-left w-full border-t border-gray-800 pt-6">
                <h3 className="text-md font-semibold text-gray-300 mb-2">Bio</h3>
                <p className="text-sm text-gray-400">{user.bio}</p>
              </div>
            )}
            
            <button className="mt-8 w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium">
              Connect with {user.name.split(' ')[0]}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}