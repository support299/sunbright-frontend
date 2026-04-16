import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import AIInsightsPage from "./features/dashboard/pages/AIInsightsPage";
import CancellationsPage from "./features/dashboard/pages/CancellationsPage";
import CleanDealsPage from "./features/dashboard/pages/CleanDealsPage";
import CustomerExperiencePage from "./features/dashboard/pages/CustomerExperiencePage";
import DataSyncPage from "./features/dashboard/pages/DataSyncPage";
import HomePage from "./features/dashboard/pages/HomePage";
import ManagerPerformancePage from "./features/dashboard/pages/ManagerPerformancePage";
import NotFoundPage from "./features/dashboard/pages/NotFoundPage";
import OnHoldPage from "./features/dashboard/pages/OnHoldPage";
import OutcomePendingPage from "./features/dashboard/pages/OutcomePendingPage";
import PipelinePage from "./features/dashboard/pages/PipelinePage";
import RepPerformancePage from "./features/dashboard/pages/RepPerformancePage";
import RetentionPage from "./features/dashboard/pages/RetentionPage";
import TeamPerformancePage from "./features/dashboard/pages/TeamPerformancePage";
import UsersRolesPage from "./features/users/pages/UsersRolesPage";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/clean-deals" element={<ProtectedRoute><CleanDealsPage /></ProtectedRoute>} />
        <Route path="/retention" element={<ProtectedRoute><RetentionPage /></ProtectedRoute>} />
        <Route path="/rep-performance" element={<ProtectedRoute><RepPerformancePage /></ProtectedRoute>} />
        <Route path="/team-performance" element={<ProtectedRoute><TeamPerformancePage /></ProtectedRoute>} />
        <Route path="/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
        <Route path="/on-hold" element={<ProtectedRoute><OnHoldPage /></ProtectedRoute>} />
        <Route path="/cancellations" element={<ProtectedRoute><CancellationsPage /></ProtectedRoute>} />
        <Route path="/customer-experience" element={<ProtectedRoute><CustomerExperiencePage /></ProtectedRoute>} />
        <Route path="/manager-performance" element={<ProtectedRoute><ManagerPerformancePage /></ProtectedRoute>} />
        <Route path="/outcome-pending" element={<ProtectedRoute><OutcomePendingPage /></ProtectedRoute>} />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute requireAdmin>
              <AIInsightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sync"
          element={
            <ProtectedRoute requireAdmin>
              <DataSyncPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireAdmin>
              <UsersRolesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
