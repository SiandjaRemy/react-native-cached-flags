import React, { createContext, useContext, useMemo } from 'react';
import {
  CachedFlagsConfig,
  getGlobalConfig,
  configureCachedFlags,
} from '../config';

const CachedFlagsContext = createContext<Required<CachedFlagsConfig> | null>(
  null
);

interface CachedFlagsProviderProps {
  config: CachedFlagsConfig;
  children: React.ReactNode;
}

export const CachedFlagsProvider = ({
  config,
  children,
}: CachedFlagsProviderProps) => {
  // Also apply to module-level config so utilities pick it up
  useMemo(() => {
    configureCachedFlags(config);
  }, [config]);

  const resolvedConfig = useMemo(
    () => ({ ...getGlobalConfig(), ...config }),
    [config]
  );

  return (
    <CachedFlagsContext.Provider value={resolvedConfig}>
      {children}
    </CachedFlagsContext.Provider>
  );
};

export const useCachedFlagsConfig = (): Required<CachedFlagsConfig> => {
  const ctx = useContext(CachedFlagsContext);
  // Fall back to global config if no provider present
  // This means the provider is optional — existing apps don't break
  return ctx ?? getGlobalConfig();
};
