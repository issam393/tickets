import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/register/Register';
import PKIDashboard from './pages/dashboard/PKIDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfilePage from './components/ui/ProfileReview/ProfilePage';


function App() {
  return (

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/dashboard" element={<PKIDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path='/ProfilePage' element={<ProfilePage  />} />
        </Routes>
      </BrowserRouter>

  );
}

export default App;
