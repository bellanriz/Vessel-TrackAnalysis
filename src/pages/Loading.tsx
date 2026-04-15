import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Loading() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Redirect after 5-6 seconds (randomized between 5000-6000ms)
  useEffect(() => {
    const delay = 5000 + Math.random() * 1000; // Random delay between 5000-6000ms
    const timer = setTimeout(() => {
      navigate("/route-comparison");
    }, delay);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "h-screen w-screen flex flex-col items-center justify-center relative",
        isDark ? "bg-maritime-deep" : "bg-white"
      )}
    >
      {/* Theme Toggle */}
      {mounted && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-card/80 backdrop-blur-sm"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
      {/* Logo Container */}
      <div className="relative mb-8">
        {/* Background circle for contrast */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-3xl opacity-20",
            isDark ? "bg-white" : "bg-black"
          )}
          style={{
            width: "300px",
            height: "300px",
            transform: "translate(-50%, -50%)",
            top: "50%",
            left: "50%",
          }}
        />
        
        {/* Logo */}
        <div className="relative z-10">
          <img
            src="/sailor-logo.png"
            alt="Sailor Logo"
            className="w-64 h-64 object-contain transition-all duration-300"
            style={{
              filter: isDark 
                ? "invert(1) brightness(1.2)" // White logo on dark background
                : "invert(0) brightness(0)", // Black logo on light background
            }}
          />
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-4">
        <h2
          className={cn(
            "text-2xl font-semibold transition-colors",
            isDark ? "text-foreground" : "text-gray-900"
          )}
        >
          Generating AI Analysis
        </h2>
        <p
          className={cn(
            "text-lg transition-colors",
            isDark ? "text-muted-foreground" : "text-gray-600"
          )}
        >
          Analyzing your voyage route{dots}
        </p>

        {/* Loading Spinner */}
        <div className="flex justify-center mt-8">
          <div className="relative w-16 h-16">
            <div
              className={cn(
                "absolute inset-0 rounded-full border-4 border-t-transparent animate-spin",
                isDark
                  ? "border-primary"
                  : "border-gray-900"
              )}
              style={{
                animationDuration: "1s",
              }}
            />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-12 space-y-2">
          <div
            className={cn(
              "text-sm transition-colors",
              isDark ? "text-muted-foreground" : "text-gray-500"
            )}
          >
            • Checking regulatory compliance
          </div>
          <div
            className={cn(
              "text-sm transition-colors",
              isDark ? "text-muted-foreground" : "text-gray-500"
            )}
          >
            • Generating communication plan
          </div>
          <div
            className={cn(
              "text-sm transition-colors",
              isDark ? "text-muted-foreground" : "text-gray-500"
            )}
          >
            • Scanning for hazards and alerts
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute rounded-full opacity-10 animate-pulse",
            isDark ? "bg-primary" : "bg-gray-400"
          )}
          style={{
            width: "200px",
            height: "200px",
            top: "10%",
            left: "10%",
            animationDuration: "3s",
          }}
        />
        <div
          className={cn(
            "absolute rounded-full opacity-10 animate-pulse",
            isDark ? "bg-primary" : "bg-gray-400"
          )}
          style={{
            width: "150px",
            height: "150px",
            bottom: "15%",
            right: "15%",
            animationDuration: "4s",
            animationDelay: "1s",
          }}
        />
      </div>
    </div>
  );
}

