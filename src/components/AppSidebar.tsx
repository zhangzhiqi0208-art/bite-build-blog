import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Star,
  FileText,
  Tag,
  UtensilsCrossed,
  ClipboardList,
  Store,
  Users,
  DollarSign,
  Settings,
  GraduationCap,
  PanelLeftClose,
} from "lucide-react";

const navSections = [
  {
    label: "ANALYSIS",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: Star, label: "Customer Feedback", path: "/feedback" },
      { icon: FileText, label: "Reports", path: "/reports" },
    ],
  },
  {
    label: "MARKETING",
    items: [{ icon: Tag, label: "Promotions", path: "/promotions" }],
  },
  {
    label: "MENU",
    items: [{ icon: UtensilsCrossed, label: "Menu", path: "/" }],
  },
  {
    label: "ORDER",
    items: [{ icon: ClipboardList, label: "Orders", path: "/orders" }],
  },
  {
    label: "STORE SETTING",
    items: [
      { icon: Store, label: "Store", path: "/store" },
      { icon: Users, label: "Users", path: "/users" },
      { icon: DollarSign, label: "Finance", path: "/finance" },
    ],
  },
  {
    label: "STORE SETTING",
    items: [
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: GraduationCap, label: "Academy", path: "/academy" },
    ],
  },
];

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" || location.pathname.startsWith("/menu");
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="flex w-56 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex-1 overflow-auto px-3 py-4">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary"
        >
          <LayoutDashboard className="h-5 w-5 text-sidebar-foreground" />
          <span className="text-sm font-medium text-sidebar-foreground">Overview</span>
        </button>

        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-2">
            <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-sidebar-border px-3 py-3">
        <button className="flex items-center gap-2 px-3 py-1 text-sm text-sidebar-muted hover:text-sidebar-foreground">
          <PanelLeftClose className="h-4 w-4" />
          <span>Fold navigation</span>
        </button>
      </div>
    </aside>
  );
};
