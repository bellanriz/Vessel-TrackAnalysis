import { useState, useEffect } from "react";
import { Anchor, Map, Mail, FileText, Ship, Settings, Bell, User, Menu, X, Sun, Moon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

interface TopNavbarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const modules = [
  { id: "voyage", label: "Voyage Planner", icon: Map },
  { id: "communications", label: "Communications", icon: Mail },
  { id: "regulations", label: "Regulations", icon: FileText },
  { id: "certificates", label: "Certificates", icon: Ship },
];

export function TopNavbar({ activeModule, onModuleChange }: TopNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-14 bg-maritime-navy border-b border-border/50 flex items-center justify-between px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {mounted && (
            <img
              src="/sailor-logo.png"
              alt="Sailor Logo"
              className="h-8 w-auto object-contain"
              style={{
                filter: theme === "dark" 
                  ? "invert(1) brightness(1.2)" // White logo on dark background
                  : "invert(0) brightness(0)", // Black logo on light background
              }}
            />
          )}
          {!mounted && (
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Anchor className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onModuleChange(module.id)}
            className={cn(
              "nav-tab flex items-center gap-2",
              activeModule === module.id && "nav-tab-active"
            )}
          >
            <module.icon className="w-4 h-4" />
            {module.label}
          </button>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Dashboard Link */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          title="Go to Dashboard"
        >
          <Home className="w-4 h-4" />
        </Button>
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-status-danger rounded-full" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="w-4 h-4" />
        </Button>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-maritime-navy border-b border-border/50 p-4 md:hidden z-50">
          <nav className="flex flex-col gap-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  onModuleChange(module.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeModule === module.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <module.icon className="w-5 h-5" />
                {module.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
