import { Link, useLocation } from "react-router-dom";
import { UploadCloud, LayoutDashboard, Activity } from "lucide-react";

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container max-w-6xl mx-auto flex items-center gap-6 h-14 px-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight mr-4 hover:opacity-80 transition-opacity"
        >
          <Activity className="w-5 h-5 text-primary" />
          <span>RDI System</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/upload"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/upload"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Upload
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/dashboard"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
