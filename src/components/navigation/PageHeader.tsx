import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { ArrowLeft, Sun, Moon, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  showHomeButton?: boolean;
  showThemeToggle?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  showBackButton = true,
  backTo,
  showHomeButton = true,
  showThemeToggle = true,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const getPageRoute = (pageName: string): string => {
    const routes: Record<string, string> = {
      Dashboard: "/dashboard",
      "Voyage Planner": "/",
      "Route Planner": "/route-planner",
      "Route Comparison": "/route-comparison",
      "Communications Plan": "/communications-plan",
      Loading: "/loading",
    };
    return routes[pageName] || "/dashboard";
  };

  return (
    <div className={cn("h-14 bg-card border-b border-border/50 flex items-center justify-between px-4 shrink-0", className)}>
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Navigation Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Navigation Menu">
              <Menu className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              Voyage Planner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/route-planner")}>
              <Home className="mr-2 h-4 w-4" />
              Route Planner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/route-comparison")}>
              <Home className="mr-2 h-4 w-4" />
              Route Comparison
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/communications-plan")}>
              <Home className="mr-2 h-4 w-4" />
              Communications Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Home Button */}
        {showHomeButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            title="Go to Dashboard"
          >
            <Home className="w-4 h-4" />
          </Button>
        )}

        {/* Theme Toggle */}
        {showThemeToggle && mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

