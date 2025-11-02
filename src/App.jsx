
import { SearchProvider } from './context/SearchContext.jsx';
import { MainLayout } from './components/Layout';
import './App.css';

export default function App() {
  console.log('[App] rendering...');
  return (
    <SearchProvider>
      <MainLayout />
    </SearchProvider>
  );
}
