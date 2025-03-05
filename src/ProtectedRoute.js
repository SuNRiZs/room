import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import SettingsContext from './SettingsContext';

const ProtectedRoute = ({ element }) => {
  const { settings } = useContext(SettingsContext);
  return settings.TOKEN ? element : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
