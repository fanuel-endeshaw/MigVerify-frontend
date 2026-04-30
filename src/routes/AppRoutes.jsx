import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Dashboard from "../pages/Dashboard";
import Overview from "../pages/Overview";
import Users from "../pages/Users";
import Registration from "../pages/Registration";
import AdminProfile from "../pages/AdminProfile";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
        <Route path="/login" element={<Login />}>
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/login" replace />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="registration" element={<Registration />} />
          {/* <Route path="admin-profile" element={<AdminProfile />} /> */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}
