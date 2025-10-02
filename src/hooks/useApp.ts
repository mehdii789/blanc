// Compatibility layer for useApp hook
// This allows existing components to continue using useApp while actually using DatabaseContext

import { useDatabase } from '../context/DatabaseContext';

export const useApp = () => {
  return useDatabase();
};
