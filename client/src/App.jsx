import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AdminPanelPage } from "./pages/AdminPanelPage.jsx";
import { ApplyLeavePage } from "./pages/ApplyLeavePage.jsx";
import { CalendarPage } from "./pages/CalendarPage.jsx";
import { ChangePasswordPage } from "./pages/ChangePasswordPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LeaveHistoryPage } from "./pages/LeaveHistoryPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="apply-leave" element={<ApplyLeavePage />} />
          <Route path="leave-history" element={<LeaveHistoryPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="admin" element={<AdminPanelPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
