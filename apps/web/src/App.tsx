import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { AppRoutes } from './app/AppRoutes';
import './styles.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
