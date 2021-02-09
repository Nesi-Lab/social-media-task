import './App.css';
import { EasybaseProvider } from 'easybase-react';
import ebconfig from './ebconfig';
import Timeline from './components/timeline'

function App() {
  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      <EasybaseProvider ebconfig={ebconfig}>
        <Timeline />
      </EasybaseProvider>
    </div>
  );
}

export default App;