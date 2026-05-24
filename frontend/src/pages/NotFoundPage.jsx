import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="text-8xl mb-6"
      >
        🎭
      </motion.div>
      <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Looks like this page took a wrong turn. Let's get you back to the events!
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/events" className="btn-secondary">Browse Events</Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
