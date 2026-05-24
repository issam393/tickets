import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/register/Register';
import PKIDashboard from './pages/dashboard/PKIDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfilePage from './components/ui/ProfileReview/ProfilePage';
import { Toaster } from 'react-hot-toast';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import RoleRedirect from './components/auth/RoleRedirect';
import ThemeToggle from './components/ui/ThemeToggle';


function App() {
  return (

      <BrowserRouter>
        <ThemeToggle />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--surface-strong)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Register />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          <Route path="/service-delivery/dashboard" element={<RoleBasedRoute allowedRoles={['SD']}><PKIDashboard initialActiveItem="Dashboard" /></RoleBasedRoute>} />
          <Route path="/service-delivery/contacts" element={<RoleBasedRoute allowedRoles={['SD']}><PKIDashboard initialActiveItem="Contacts" /></RoleBasedRoute>} />
          <Route path="/service-delivery/create-ticket" element={<RoleBasedRoute allowedRoles={['SD']}><PKIDashboard initialActiveItem="Create Ticket" /></RoleBasedRoute>} />
          <Route path="/service-delivery/tickets" element={<RoleBasedRoute allowedRoles={['SD']}><PKIDashboard initialActiveItem="Tickets" /></RoleBasedRoute>} />
          <Route path="/service-delivery/messages" element={<RoleBasedRoute allowedRoles={['SD']}><PKIDashboard initialActiveItem="Messages" /></RoleBasedRoute>} />
          <Route path="/service-delivery/meetings" element={<RoleBasedRoute allowedRoles={['SD']}><PKIDashboard initialActiveItem="Meetings" /></RoleBasedRoute>} />

          <Route path="/manager/dashboard" element={<RoleBasedRoute allowedRoles={['Manager']}><PKIDashboard initialActiveItem="Dashboard" /></RoleBasedRoute>} />
          <Route path="/manager/contacts" element={<RoleBasedRoute allowedRoles={['Manager']}><PKIDashboard initialActiveItem="Contacts" /></RoleBasedRoute>} />
          <Route path="/manager/tickets" element={<RoleBasedRoute allowedRoles={['Manager']}><PKIDashboard initialActiveItem="Tickets" /></RoleBasedRoute>} />
          <Route path="/manager/messages" element={<RoleBasedRoute allowedRoles={['Manager']}><PKIDashboard initialActiveItem="Messages" /></RoleBasedRoute>} />
          <Route path="/manager/meetings" element={<RoleBasedRoute allowedRoles={['Manager']}><PKIDashboard initialActiveItem="Meetings" /></RoleBasedRoute>} />

          <Route path="/pki/dashboard" element={<RoleBasedRoute allowedRoles={['PKI']}><PKIDashboard initialActiveItem="Dashboard" /></RoleBasedRoute>} />
          <Route path="/pki/tickets" element={<RoleBasedRoute allowedRoles={['PKI']}><PKIDashboard initialActiveItem="Tickets" /></RoleBasedRoute>} />
          <Route path="/pki/messages" element={<RoleBasedRoute allowedRoles={['PKI']}><PKIDashboard initialActiveItem="Messages" /></RoleBasedRoute>} />
          <Route path="/pki/meetings" element={<RoleBasedRoute allowedRoles={['PKI']}><PKIDashboard initialActiveItem="Meetings" /></RoleBasedRoute>} />

          <Route path="/it/dashboard" element={<RoleBasedRoute allowedRoles={['IT']}><PKIDashboard initialActiveItem="Dashboard" /></RoleBasedRoute>} />
          <Route path="/it/tickets" element={<RoleBasedRoute allowedRoles={['IT']}><PKIDashboard initialActiveItem="Tickets" /></RoleBasedRoute>} />
          <Route path="/it/messages" element={<RoleBasedRoute allowedRoles={['IT']}><PKIDashboard initialActiveItem="Messages" /></RoleBasedRoute>} />
          <Route path="/it/meetings" element={<RoleBasedRoute allowedRoles={['IT']}><PKIDashboard initialActiveItem="Meetings" /></RoleBasedRoute>} />

          <Route path="/admin" element={<RoleBasedRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleBasedRoute>} />
          <Route path='/ProfilePage' element={<RoleBasedRoute allowedRoles={['SD', 'Manager', 'PKI', 'IT', 'ADMIN']}><ProfilePage /></RoleBasedRoute>} />
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>

  );
}

export default App;
