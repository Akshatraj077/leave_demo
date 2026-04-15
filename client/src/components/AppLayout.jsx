import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Apply Leave", to: "/apply-leave" },
  { label: "Leave History", to: "/leave-history" },
  { label: "Calendar", to: "/calendar" },
  { label: "Profile", to: "/profile" },
  { label: "Password", to: "/change-password" }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-panel px-4 py-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky/40 bg-sky/10 font-bold text-sky">
            ML
          </div>
          <div>
            <p className="font-semibold">MagiCalabs LMS</p>
            <p className="text-xs text-slate-500">HR operations</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-sky/15 text-sky" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>
              {item.label}
            </NavLink>
          ))}
          {user?.role === "ADMIN" ? (
            <NavLink to="/admin" className={({ isActive }) => `block rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-gold/15 text-gold" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>
              Admin Panel
            </NavLink>
          ) : null}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-ink/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Financial year April-March</p>
              <h1 className="text-xl font-semibold text-slate-100">Leave Management & Employee HR</h1>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-panel px-3 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mint/10 text-sm font-bold text-mint">
                  {initials || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>
              <button className="rounded-md border border-line px-3 py-2 text-sm text-slate-300 hover:border-rose hover:text-rose" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          <nav className="mx-auto mt-4 flex max-w-7xl gap-2 overflow-x-auto lg:hidden">
            {[...navItems, ...(user?.role === "ADMIN" ? [{ label: "Admin", to: "/admin" }] : [])].map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `whitespace-nowrap rounded-md border px-3 py-2 text-sm ${isActive ? "border-sky bg-sky/10 text-sky" : "border-line text-slate-400"}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
