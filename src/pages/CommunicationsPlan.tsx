import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, FileText, Mail, Paperclip, Download, Check, Loader2, Search, FileCheck, Calendar, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AgentLog {
  id: string;
  type: "info" | "success" | "search" | "processing" | "completed";
  message: string;
  timestamp: number;
}

interface CommunicationPlan {
  id: string;
  portName: string;
  authority: string;
  sendTime: string;
  documentsCount: number;
  status: "ready" | "approved";
  email: {
    subject: string;
    body: string;
    attachments: string[];
  };
  requirements: string[];
}

// Demo ports from selected route
const demoPorts = [
  { name: "France", authority: "France Port Authority", country: "France" },
  { name: "Colombia", authority: "Colombia Coast Guard", country: "Colombia" },
  { name: "America", authority: "America VTS", country: "America" },
];

// Demo ship documents
const shipDocuments = [
  "International Tonnage Certificate",
  "Greenhouse Gas Certificate",
  "Ship Security Certificate",
  "Load Line Certificate",
  "Oil Record Book",
  "Garbage Record Book",
  "Cargo Securing Manual",
  "Minimum Safe Manning Document",
  "Safety Management Certificate",
  "International Ship Security Certificate",
  "P&I Insurance Certificate",
  "Classification Certificate",
];

export default function CommunicationsPlan() {
  const navigate = useNavigate();
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [communicationPlans, setCommunicationPlans] = useState<CommunicationPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CommunicationPlan | null>(null);
  const [allApproved, setAllApproved] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedRoute] = useState<string | null>(() => {
    // Get selected route from localStorage or default to "B"
    return localStorage.getItem("selectedRoute") || "B";
  });

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLogs]);

  // Agent simulation steps
  useEffect(() => {
    if (!isProcessing) return;

    const steps = [
      // Step 1: Detecting ports
      {
        delay: 500,
        log: { type: "info" as const, message: "Detecting destination ports from selected route..." },
      },
      {
        delay: 800,
        log: { type: "success" as const, message: `→ Found ${demoPorts.length} ports: ${demoPorts.map(p => p.name).join(", ")}.` },
      },
      // Step 2: Loading port requirements
      {
        delay: 1000,
        log: { type: "search" as const, message: `Searching knowledge base for: "${demoPorts[0].name} Port Communication Requirements"...` },
      },
      {
        delay: 1200,
        log: { type: "success" as const, message: "✓ Found 12 related policies." },
      },
      {
        delay: 800,
        log: { type: "info" as const, message: "Extracting mandatory documents required for port entry..." },
      },
      {
        delay: 1000,
        log: { type: "search" as const, message: `Searching: "${demoPorts[1].authority} Advance Notice Requirements"...` },
      },
      {
        delay: 1000,
        log: { type: "search" as const, message: `Searching: "${demoPorts[2].authority} Pre-Arrival Protocols"...` },
      },
      // Step 3: Matching documents
      {
        delay: 800,
        log: { type: "processing" as const, message: `Matching required documents for ${demoPorts[0].name}...` },
      },
      {
        delay: 600,
        log: { type: "success" as const, message: "   → International Tonnage Certificate: ✔ Found" },
      },
      {
        delay: 400,
        log: { type: "success" as const, message: "   → Load Line Certificate: ✔ Found" },
      },
      {
        delay: 400,
        log: { type: "success" as const, message: "   → Safety Management Certificate: ✔ Found" },
      },
      {
        delay: 400,
        log: { type: "success" as const, message: "   → Garbage Record Book: ✔ Found" },
      },
      {
        delay: 600,
        log: { type: "success" as const, message: "   → Other required docs: ✔ Retrieved" },
      },
      // Step 4: Generating emails
      {
        delay: 800,
        log: { type: "processing" as const, message: `Composing email for ${demoPorts[0].authority}...` },
      },
      {
        delay: 600,
        log: { type: "info" as const, message: "→ Including vessel particulars" },
      },
      {
        delay: 500,
        log: { type: "info" as const, message: "→ Adding captain's information" },
      },
      {
        delay: 500,
        log: { type: "info" as const, message: "→ Attaching 8 mandatory certificates" },
      },
      {
        delay: 500,
        log: { type: "info" as const, message: "→ Adding ETA: 24 hours before arrival" },
      },
      {
        delay: 800,
        log: { type: "processing" as const, message: `Drafting ${demoPorts[1].authority} pre-arrival email...` },
      },
      {
        delay: 800,
        log: { type: "processing" as const, message: `Drafting ${demoPorts[2].authority} pre-arrival notice...` },
      },
      // Step 5: Timestamp logic
      {
        delay: 800,
        log: { type: "info" as const, message: "Calculating required send time:" },
      },
      {
        delay: 600,
        log: { type: "info" as const, message: "    → Singapore ETA: Jan 24 14:00" },
      },
      {
        delay: 500,
        log: { type: "info" as const, message: "    → Sending email at: Jan 23 14:00 (24h prior)" },
      },
      // Step 6: Assembling plans
      {
        delay: 800,
        log: { type: "processing" as const, message: "Assembling Communication Plans..." },
      },
      {
        delay: 600,
        log: { type: "success" as const, message: "→ Singapore plan ready." },
      },
      {
        delay: 500,
        log: { type: "success" as const, message: "→ Colombo plan ready." },
      },
      {
        delay: 500,
        log: { type: "success" as const, message: "→ Dubai plan ready." },
      },
      {
        delay: 800,
        log: { type: "completed" as const, message: "Completed all communication plans." },
      },
    ];

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const processStep = () => {
      if (currentIndex >= steps.length) {
        setIsProcessing(false);
        // Generate communication plans
        const plans: CommunicationPlan[] = demoPorts.map((port, index) => {
          const sendDate = new Date();
          sendDate.setDate(sendDate.getDate() + index + 1);
          sendDate.setHours(14, 0, 0, 0);

          return {
            id: `plan-${index}`,
            portName: port.name,
            authority: port.authority,
            sendTime: sendDate.toISOString(), // Store as ISO string for proper parsing
            documentsCount: 8,
            status: "ready",
            email: {
              subject: `Pre-Arrival Notice - Vessel [VESSEL_NAME] - ${port.name}`,
              body: `Dear ${port.authority},\n\nThis email serves as the mandatory pre-arrival notice for our vessel [VESSEL_NAME].\n\nVessel Particulars:\n- IMO Number: [IMO]\n- Flag: [FLAG]\n- Gross Tonnage: [GT]\n- ETA: ${sendDate.toLocaleDateString()} at 14:00 local time\n\nPlease find attached all required documents for port entry.\n\nBest regards,\n[CAPTAIN_NAME]\nMaster, [VESSEL_NAME]`,
              attachments: shipDocuments.slice(0, 8),
            },
            requirements: [
              "24-hour advance notice required",
              "All certificates must be valid",
              "Captain's declaration required",
            ],
          };
        });
        setCommunicationPlans(plans);
        return;
      }

      const step = steps[currentIndex];
      const log: AgentLog = {
        id: `log-${Date.now()}-${currentIndex}`,
        ...step.log,
        timestamp: Date.now(),
      };

      setAgentLogs((prev) => [...prev, log]);
      setCurrentStep(currentIndex);

      currentIndex++;
      timeoutId = setTimeout(processStep, step.delay);
    };

    processStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isProcessing]);

  const getLogIcon = (type: AgentLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-status-safe" />;
      case "search":
        return <Search className="w-4 h-4 text-primary animate-pulse" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-status-safe" />;
      default:
        return <span className="text-primary">▶</span>;
    }
  };

  const handleApproveAll = () => {
    const approvedPlans = communicationPlans.map((plan) => ({ ...plan, status: "approved" as const }));
    setCommunicationPlans(approvedPlans);
    setAllApproved(true);
    
    // Store approved plans in localStorage for dashboard
    const plansForDashboard = approvedPlans.map((plan) => ({
      id: plan.id,
      portName: plan.portName,
      authority: plan.authority,
      sendTime: plan.sendTime,
      documentsCount: plan.documentsCount,
      status: "pending" as const, // Start as pending, will be sent later
      email: plan.email,
      voyageName: `Route ${selectedRoute || "B"} - ${plan.portName}`,
      type: "Port Entry Request",
      recipient: plan.authority,
      dueIn: calculateDueIn(plan.sendTime),
    }));
    
    // Get existing plans from localStorage
    const existingPlans = JSON.parse(localStorage.getItem("communicationPlans") || "[]");
    const updatedPlans = [...existingPlans, ...plansForDashboard];
    localStorage.setItem("communicationPlans", JSON.stringify(updatedPlans));
    
    // Navigate to dashboard after a short delay
    setTimeout(() => {
      navigate("/dashboard?scrollTo=communications");
    }, 500);
  };

  const calculateDueIn = (sendTime: string): string => {
    try {
      const sendDate = new Date(sendTime);
      const now = new Date();
      const diffMs = sendDate.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (isNaN(sendDate.getTime())) {
        return "Pending";
      }
      
      if (diffMs < 0) {
        return "Overdue";
      } else if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins > 0 ? `${diffMins} minute${diffMins !== 1 ? "s" : ""}` : "Due now";
      }
    } catch (e) {
      return "Pending";
    }
  };

  const handleExportAll = () => {
    // TODO: Implement PDF export
    console.log("Exporting all communication plans...");
  };

  const handleDelete = (planId: string) => {
    // Find the plan to delete
    const planToDelete = communicationPlans.find((plan) => plan.id === planId);
    if (!planToDelete) return;

    // Remove from active plans
    const updatedPlans = communicationPlans.filter((plan) => plan.id !== planId);
    setCommunicationPlans(updatedPlans);
    
    // Update localStorage
    const plansForDashboard = updatedPlans
      .filter((plan) => plan.status === "approved")
      .map((plan) => ({
        id: plan.id,
        portName: plan.portName,
        authority: plan.authority,
        sendTime: plan.sendTime,
        documentsCount: plan.documentsCount,
        type: "Port Entry Request",
        status: "pending" as const,
        dueIn: calculateDueIn(plan.sendTime),
        voyageName: `Route ${selectedRoute || "B"} - ${plan.portName}`,
        recipient: plan.authority,
      }));
    localStorage.setItem("communicationPlans", JSON.stringify(plansForDashboard));

    // Add to trash bin with timestamp
    const trashBin = JSON.parse(localStorage.getItem("communicationPlansTrash") || "[]");
    trashBin.push({
      ...planToDelete,
      deletedAt: new Date().toISOString(),
    });
    localStorage.setItem("communicationPlansTrash", JSON.stringify(trashBin));

    // Close details if deleted plan was selected
    if (selectedPlan?.id === planId) {
      setSelectedPlan(null);
      setShowPlanDetails(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <PageHeader
        title="Unified Communications Plan"
        description="AI-generated port communication plans"
        backTo="/route-comparison"
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Agent Simulation (65%) */}
        <div className="flex-[0.65] border-r border-border/50 flex flex-col bg-maritime-deep">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-status-safe animate-pulse" />
              <span className="text-sm font-medium text-foreground">AI Agent Console</span>
              {isProcessing && (
                <Badge variant="info" className="ml-2">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2 font-mono text-sm">
              {agentLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-2 py-1",
                    log.type === "success" && "text-status-safe",
                    log.type === "info" && "text-foreground",
                    log.type === "search" && "text-primary",
                    log.type === "processing" && "text-primary",
                    log.type === "completed" && "text-status-safe font-semibold"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{getLogIcon(log.type)}</div>
                  <div className="flex-1">
                    <span className="text-muted-foreground">[Agent]</span> {log.message}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 py-1 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-muted-foreground">[Agent]</span> Processing
                  <span className="animate-pulse">•••</span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Communication Plans (35%) */}
        <div className="flex-[0.35] bg-card flex flex-col overflow-hidden min-w-[400px]">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Communication Plans</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {communicationPlans.length} plan{communicationPlans.length !== 1 ? "s" : ""} generated
            </p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {communicationPlans.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                    <p>Generating communication plans...</p>
                  </CardContent>
                </Card>
              ) : (
                communicationPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/50 relative group",
                      plan.status === "approved" && "ring-2 ring-status-safe"
                    )}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowPlanDetails(true);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{plan.portName}</CardTitle>
                          <CardDescription className="text-xs mt-1">{plan.authority}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {plan.status === "approved" && (
                            <Badge variant="safe">
                              <Check className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete the communication plan for ${plan.portName}?`)) {
                                handleDelete(plan.id);
                              }
                            }}
                            title="Delete communication plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Send: {plan.sendTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Paperclip className="w-3 h-3" />
                        <span>{plan.documentsCount} documents</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>Email: Ready for Review</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete the communication plan for ${plan.portName}?`)) {
                            handleDelete(plan.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {communicationPlans.length > 0 && (
        <div className="h-16 bg-card border-t border-border/50 flex items-center justify-between px-4 shrink-0">
          <Button variant="outline" onClick={() => navigate("/route-comparison")}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button
              onClick={handleApproveAll}
              disabled={allApproved}
              className={allApproved ? "bg-status-safe hover:bg-status-safe" : ""}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {allApproved ? "All Approved" : "Approve All Plans"}
            </Button>
          </div>
        </div>
      )}

      {/* Plan Details Sheet */}
      <Sheet open={showPlanDetails} onOpenChange={setShowPlanDetails}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPlan && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPlan.portName} Communication Plan</SheetTitle>
                <SheetDescription>{selectedPlan.authority}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Send Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Required Send Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {new Date(selectedPlan.sendTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      24 hours before estimated time of arrival
                    </p>
                  </CardContent>
                </Card>

                {/* Email Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Draft
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Subject</label>
                      <p className="text-sm mt-1">{selectedPlan.email.subject}</p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Body</label>
                      <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono">
                        {selectedPlan.email.body}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments ({selectedPlan.documentsCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedPlan.email.attachments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm">{doc}</span>
                          <CheckCircle2 className="w-4 h-4 text-status-safe ml-auto" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      Port Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPlan.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setCommunicationPlans((prev) =>
                        prev.map((p) => (p.id === selectedPlan.id ? { ...p, status: "approved" as const } : p))
                      );
                      setShowPlanDetails(false);
                    }}
                    disabled={selectedPlan.status === "approved"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {selectedPlan.status === "approved" ? "Approved" : "Approve Plan"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

