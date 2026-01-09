import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import Doctors from './pages/Doctors';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/doctors" element={<Doctors />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
