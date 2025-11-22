// frontend/src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Department from '../pages/Department';
import Group from '../pages/Group.jsx';
import Make from '../pages/Make.jsx';
import ScheduleAllocation from '../pages/ScheduleAllocation.jsx';
import Motors from '../pages/Motors.jsx';
import MotorMaster from '../pages/MotorMaster.jsx';
import MotorScheduleMaster from '../pages/MotorScheduleMaster.jsx';
import InitialMotorAllocation from '../pages/InitialMotorAllocation.jsx';
import InitialMotorScheduleAllocation from '../pages/InitialMotorScheduleAllocation.jsx';
import Transaction from '../pages/Transaction.jsx';
import Maintenance from '../pages/Maintenance.jsx';
import TransactionMotors from '../pages/TransactionMotors.jsx';
import Reports from '../pages/Reports.jsx';

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/department" element={<Department />} />
        <Route path="/group" element={<Group />} />
        <Route path="/make" element={<Make />} />
        <Route path="/schedule-allocation" element={<ScheduleAllocation />} />
        <Route path="/motors" element={<Motors />} />
        <Route path="/motor-master" element={<MotorMaster />} />
        <Route path="/motor-schedule-master" element={<MotorScheduleMaster />} />
        <Route path="/initial-motor-allocation" element={<InitialMotorAllocation />} />
        <Route path="/initial-motor-schedule-allocation" element={<InitialMotorScheduleAllocation />} />
        <Route path="/transaction" element={<Transaction />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/trans-motors" element={<TransactionMotors />} />
        <Route path="/reports" element={<Reports />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;