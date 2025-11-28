import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Receiving } from './pages/Receiving';
import { Processing } from './pages/Processing';
import { Packing } from './pages/Packing';
import { Inventory } from './pages/Inventory';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { AppProvider, useApp } from './context/AppContext';

// Inner component to access context
const AppContent = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'receiving': return <Receiving />;
      case 'processing': return <Processing />;
      case 'packing': return <Packing />;
      case 'inventory': return <Inventory />;
      case 'admin': return <Admin />;
      case 'reports': return <div className="p-10 text-center text-gray-500">Reports Module coming soon</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;