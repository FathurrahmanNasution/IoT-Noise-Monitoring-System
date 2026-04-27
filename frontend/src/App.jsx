import Dashboard from './components/Dashboard';
import { useNoiseData } from './hooks/useNoiseData';
import './index.css';

function App() {
  const data = useNoiseData();

  return <Dashboard data={data} />;
}

export default App;
