import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/navigation/PageHeader";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <PageHeader
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist"
        showBackButton={true}
        backTo="/dashboard"
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/dashboard")}>
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voyage Planner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
