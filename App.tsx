
import { OfficeLocationProvider } from './src/contexts/OfficeLocationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <OfficeLocationProvider>
      <AppNavigator />
    </OfficeLocationProvider>
  );
}
