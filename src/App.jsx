import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Products from './pages/Products.jsx'
import Equipments from './pages/Equipments.jsx'
import ImportData from './pages/ImportData.jsx'
import DataLoads from './pages/DataLoads.jsx'
import EntitiesAdmin from './pages/EntitiesAdmin.jsx'
import DonationRequests from './pages/DonationRequests.jsx'
import DonationRequestDetail from './pages/DonationRequestDetail.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/equipments" element={<Equipments />} />
        <Route path="/import" element={<ImportData />} />
        <Route path="/data-loads" element={<DataLoads />} />
        <Route path="/admin/entities" element={<EntitiesAdmin />} />
        <Route path="/admin/donation-requests" element={<DonationRequests />} />
        <Route path="/admin/donation-requests/:id" element={<DonationRequestDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
