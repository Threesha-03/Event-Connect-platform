import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const OrganizerRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return <Navigate to="/become-organizer" replace />;
  }

  return children;
};

export default OrganizerRoute;
