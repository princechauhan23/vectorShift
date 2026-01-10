import { useEffect, useState } from 'react';
import { fetchNodeDefinitions, restoreFromPersistedStore } from './nodes/nodeRegistry';
import PipelineToolbar from './components/toolbar';
import PipelineUI from './components/ui';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNodeDefinitions = async () => {
      // First, try to restore from persisted Zustand store for instant UI
      const restored = restoreFromPersistedStore();
      
      if (restored) {
        // Show UI immediately with cached data
        setIsLoading(false);
      }

      // Always fetch fresh data from the API
      const result = await fetchNodeDefinitions();
      if (!result.success) {
        // Only show error if we don't have cached data
        if (!restored) {
          setError(result.error);
        }
      }
      setIsLoading(false);
    };

    loadNodeDefinitions();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        Loading node definitions...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#ef4444'
      }}>
        <p>Failed to load node definitions</p>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PipelineToolbar />
      <PipelineUI />
    </div>
  );
}

export default App;
