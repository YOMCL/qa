import React from 'react';
import { AuthGuard } from './components/AuthGuard';

const Bootstrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
      <Bootstrapper>
        <AuthGuard />
      </Bootstrapper>
  );
};

export default App;
