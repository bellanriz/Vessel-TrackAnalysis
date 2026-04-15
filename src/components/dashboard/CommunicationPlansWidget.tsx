import { useState, useEffect } from "react";
import { Clock, Mail, CheckCircle2, XCircle, Send, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommunicationPlan {
  id: string;
  voyageName: string;
  recipient: string;
  type: string;
  status: "pending" | "sent" | "failed";
  dueIn: string;
  portName?: string;
  authority?: string;
  sendTime?: string;
  documentsCount?: number;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-status-caution/20 text-status-caution border-status-caution/30",
    label: "Pending",
  },
  sent: {
    icon: CheckCircle2,
    color: "bg-status-safe/20 text-status-safe border-status-safe/30",
    label: "Sent",
  },
  failed: {
    icon: XCircle,
    color: "bg-status-danger/20 text-status-danger border-status-danger/30",
    label: "Failed",
  },
};

export function CommunicationPlansWidget() {
  const [communicationPlans, setCommunicationPlans] = useState<CommunicationPlan[]>([]);

  useEffect(() => {
    // Load plans from localStorage
    const loadPlans = () => {
      const stored = localStorage.getItem("communicationPlans");
      if (stored) {
        try {
          const plans = JSON.parse(stored);
          setCommunicationPlans(plans);
        } catch (e) {
          console.error("Error loading communication plans:", e);
        }
      }
    };

    loadPlans();
    
    // Listen for storage changes (in case plans are updated from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "communicationPlans") {
        loadPlans();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for updates (in case same tab)
    const interval = setInterval(loadPlans, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleSend = (planId: string) => {
    // Update plan status to "sent"
    const updatedPlans = communicationPlans.map((plan) =>
      plan.id === planId ? { ...plan, status: "sent" as const, dueIn: "Sent" } : plan
    );
    setCommunicationPlans(updatedPlans);
    localStorage.setItem("communicationPlans", JSON.stringify(updatedPlans));
  };

  const handleDelete = (planId: string) => {
    // Find the plan to delete
    const planToDelete = communicationPlans.find((plan) => plan.id === planId);
    if (!planToDelete) return;

    // Remove from active plans
    const updatedPlans = communicationPlans.filter((plan) => plan.id !== planId);
    setCommunicationPlans(updatedPlans);
    localStorage.setItem("communicationPlans", JSON.stringify(updatedPlans));

    // Add to trash bin with timestamp
    const trashBin = JSON.parse(localStorage.getItem("communicationPlansTrash") || "[]");
    trashBin.push({
      ...planToDelete,
      deletedAt: new Date().toISOString(),
    });
    localStorage.setItem("communicationPlansTrash", JSON.stringify(trashBin));
  };

  // Filter to show pending and sent plans (hide failed for now)
  const activePlans = communicationPlans.filter((plan) => plan.status !== "failed");

  return (
    <Card id="communications-widget" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Active Communication Plans</h3>
        <Mail className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {activePlans.length > 0 ? (
          activePlans.map((plan) => {
            const config = statusConfig[plan.status as keyof typeof statusConfig];
            const Icon = config.icon;

            return (
              <div
                key={plan.id}
                className="p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors relative group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {plan.voyageName || plan.portName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.recipient || plan.authority}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", config.color)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete this communication plan?`)) {
                          handleDelete(plan.id);
                        }
                      }}
                      title="Delete communication plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">{plan.type}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {plan.dueIn}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 mt-2 text-xs"
                      onClick={() => handleSend(plan.id)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send Now
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10",
                      plan.status === "pending" ? "flex-shrink-0" : "w-full"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete this communication plan?`)) {
                        handleDelete(plan.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
                {plan.documentsCount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.documentsCount} document{plan.documentsCount !== 1 ? "s" : ""} attached
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active communication plans
          </p>
        )}
      </div>
    </Card>
  );
}

