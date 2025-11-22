// frontend/src/App.jsx
// import AppRoutes from './routes/AppRoutes';

// function App() {
//   return <AppRoutes />;
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Masters from './pages/Masters';
import Department from './pages/Department';
// import Motors from './pages/Motors';
// import Schedules from './pages/Schedules';
// import Maintenance from './pages/Maintenance';
// import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import Group from './pages/Group';
import Make from './pages/Make';
import WorkType from './pages/WorkType';
import Schedule from './pages/Schedule';
import ScheduleAllocation from './pages/ScheduleAllocation';
import Motors from './pages/Motors';
import MotorMaster from './pages/MotorMaster';
import MotorScheduleMaster from './pages/MotorScheduleMaster';
import InitialMotorAllocation from './pages/InitialMotorAllocation';
import InitialMotorScheduleAllocation from './pages/InitialMotorScheduleAllocation';
import Transaction from './pages/Transaction';
import Maintenance from './pages/Maintenance';
import TransactionMotors from './pages/TransactionMotors';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/machines" 
          element={
            <ProtectedRoute>
              <Machines />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/masters" 
          element={
            <ProtectedRoute>
              <Masters />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department" 
          element={
            <ProtectedRoute>
              <Department />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/group" 
          element={
            <ProtectedRoute>
              <Group />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/make" 
          element={
            <ProtectedRoute>
              <Make />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worktype" 
          element={
            <ProtectedRoute>
              <WorkType />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schedule-allocation" 
          element={
            <ProtectedRoute>
              <ScheduleAllocation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/motors" 
          element={
            <ProtectedRoute>
              <Motors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/motor-master" 
          element={
            <ProtectedRoute>
              <MotorMaster />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/motor-schedule-master" 
          element={
            <ProtectedRoute>
              <MotorScheduleMaster/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/initial-motor-allocation" 
          element={
            <ProtectedRoute>
              <InitialMotorAllocation/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/initial-motor-schedule-allocation" 
          element={
            <ProtectedRoute>
              <InitialMotorScheduleAllocation/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transaction" 
          element={
            <ProtectedRoute>
              <Transaction />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trans-motors" 
          element={
            <ProtectedRoute>
              <TransactionMotors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;