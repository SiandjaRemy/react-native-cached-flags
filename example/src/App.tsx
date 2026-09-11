import { CachedFlagsProvider } from 'react-native-cached-flags';
import Display from './Display';
import { myConfig } from './config';

const App = () => {
  return (
    <CachedFlagsProvider config={myConfig}>
      <Display />
    </CachedFlagsProvider>
  );
};

export default App;
