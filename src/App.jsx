
import { SearchProvider } from './context/SearchContext.jsx';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/Layout';
import './App.css';

export default function App() {
  console.log('[App] rendering...');
  return (
    <ToastProvider>
      <SearchProvider>
        <MainLayout />
      </SearchProvider>
    </ToastProvider>
  );
}
