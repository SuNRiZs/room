import { useContext } from 'react';
import SettingsContext from './SettingsContext';

const useConfig = () => {
  const { settings } = useContext(SettingsContext);
  return settings;
};

export default useConfig;
