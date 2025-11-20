import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../../public/anyCardLogo.png";

interface HeaderSimpleProps {
  links: {
    link: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function HeaderSimple({
  links,
  isCollapsed,
  onToggleCollapse,
}: HeaderSimpleProps) {
  const { user } = useAuth();
  const location = useLocation();

  const items = links.map((link) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.link;

    return (
      <Link
        key={link.label}
        to={link.link}
        className={`flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
          isActive
            ? "bg-blue-100 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        } ${isCollapsed ? "justify-center" : ""}`}
        title={isCollapsed ? link.label : undefined}
      >
        <Icon
          className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : ""}`}
        />
        {!isCollapsed && <span>{link.label}</span>}
      </Link>
    );
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header Section */}
      <div
        className={`h-[60px] border-b border-gray-200 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-4`}
      >
        {!isCollapsed && (
          <img className="h-[90%] m-auto ml-0" src={logo} alt="" />
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">{items}</nav>
    </aside>
  );
}
