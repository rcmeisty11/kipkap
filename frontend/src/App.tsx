import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Login from "@/pages/auth/Login";
import Callback from "@/pages/auth/Callback";
import Dashboard from "@/pages/Dashboard";
import StudentsPage from "@/pages/Students";
import ExportPage from "@/pages/Export";
import ActionStepsPage from "@/pages/ActionSteps";
import LeaderDashboardPage from "@/pages/leader/Dashboard";
import RubricsPage from "@/pages/leader/Rubrics";
import NewRubricPage from "@/pages/leader/NewRubric";
import FeedbackPage from "@/pages/leader/Feedback";
import ImportPage from "@/pages/assignments/ImportPage";
import IntegrationsPage from "@/pages/settings/Integrations";
import SyncPage from "@/pages/settings/Sync";
import { AssignmentsPage } from "@/pages/assignments/AssignmentsPage";
import GroupsPage from "@/pages/assignments/GroupsPage";
import FocusGroupsPage from "@/pages/FocusGroups";
import { Loader2 } from "lucide-react";

// ---- Protected route wrapper ----
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/callback" element={<Callback />} />

      {/* Protected routes inside Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="assignments/groups" element={<GroupsPage />} />
        <Route path="assignments/import" element={<ImportPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="focus-groups" element={<FocusGroupsPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="action-steps" element={<ActionStepsPage />} />
        <Route path="leader/dashboard" element={<LeaderDashboardPage />} />
        <Route path="leader/rubrics" element={<RubricsPage />} />
        <Route path="leader/rubrics/new" element={<NewRubricPage />} />
        <Route
          path="leader/rubrics/:rubricId/feedback/:teacherId"
          element={<FeedbackPage />}
        />
        <Route path="settings/integrations" element={<IntegrationsPage />} />
        <Route path="settings/sync" element={<SyncPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
