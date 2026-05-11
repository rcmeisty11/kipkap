import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Grid3x3,
  Users,
  Target,
  Download,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Settings,
  RefreshCw,
  Menu,
  LogOut,
  ChevronLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const teacherNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Assignments", to: "/assignments", icon: FileText },
  { label: "Standards Groups", to: "/assignments/groups", icon: Grid3x3 },
  { label: "Students", to: "/students", icon: Users },
  { label: "Focus Groups", to: "/focus-groups", icon: Target },
  { label: "Export", to: "/export", icon: Download },
  { label: "Action Steps", to: "/action-steps", icon: ClipboardCheck },
];

const leaderNav: NavItem[] = [
  { label: "Leader Dashboard", to: "/leader/dashboard", icon: BarChart3 },
  { label: "Rubrics", to: "/leader/rubrics", icon: BookOpen },
];

const settingsNav: NavItem[] = [
  { label: "Integrations", to: "/settings/integrations", icon: Settings },
  { label: "Sync", to: "/settings/sync", icon: RefreshCw },
];

function SidebarLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
          collapsed && "justify-center px-2",
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, isLeader } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ease-in-out",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          {sidebarOpen ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                  K
                </div>
                <span className="text-lg font-semibold tracking-tight text-gray-900">
                  KipKap Badge
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              K
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Teacher nav */}
          <div className="space-y-1">
            {!sidebarOpen ? null : (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Teaching
              </p>
            )}
            {teacherNav.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                collapsed={!sidebarOpen}
              />
            ))}
          </div>

          {/* Leader nav */}
          {isLeader && (
            <div className="mt-6 space-y-1">
              {!sidebarOpen ? (
                <div className="mx-auto my-3 h-px w-6 bg-gray-200" />
              ) : (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Leadership
                </p>
              )}
              {leaderNav.map((item) => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  collapsed={!sidebarOpen}
                />
              ))}
            </div>
          )}

          {/* Settings nav */}
          <div className="mt-6 space-y-1">
            {!sidebarOpen ? (
              <div className="mx-auto my-3 h-px w-6 bg-gray-200" />
            ) : (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Settings
              </p>
            )}
            {settingsNav.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                collapsed={!sidebarOpen}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-1.5 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
