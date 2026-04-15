import { useState } from "react";
import {
  Mail,
  Clock,
  Check,
  AlertCircle,
  Send,
  FileText,
  Ship,
  Building2,
  Calendar,
  ChevronRight,
  Plus,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CommunicationsPanelProps {
  className?: string;
}

const scheduledEmails = [
  {
    id: 1,
    type: "VTS Arrival",
    recipient: "Tampa VTS",
    port: "Tampa Bay",
    status: "sent",
    scheduledTime: "2024-12-05 08:00",
    sentTime: "2024-12-05 08:00",
  },
  {
    id: 2,
    type: "Agent Notification",
    recipient: "Gulf Shipping Agency",
    port: "Tampa Bay",
    status: "sent",
    scheduledTime: "2024-12-05 06:00",
    sentTime: "2024-12-05 06:02",
  },
  {
    id: 3,
    type: "Port Terminal",
    recipient: "Cozumel Port Authority",
    port: "Cozumel",
    status: "scheduled",
    scheduledTime: "2024-12-07 14:00",
    hoursRemaining: 48,
  },
  {
    id: 4,
    type: "VTS Arrival",
    recipient: "Cozumel VTS",
    port: "Cozumel",
    status: "scheduled",
    scheduledTime: "2024-12-07 16:00",
    hoursRemaining: 50,
  },
  {
    id: 5,
    type: "Waste Declaration",
    recipient: "Cozumel Port Reception",
    port: "Cozumel",
    status: "draft",
    scheduledTime: "2024-12-07 12:00",
  },
];

export function CommunicationsPanel({ className }: CommunicationsPanelProps) {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const sentCount = scheduledEmails.filter((e) => e.status === "sent").length;
  const scheduledCount = scheduledEmails.filter((e) => e.status === "scheduled").length;
  const draftCount = scheduledEmails.filter((e) => e.status === "draft").length;

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Communication Plan
          </h2>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Email
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-status-safe" />
              <span className="text-xs text-muted-foreground">Sent</span>
            </div>
            <p className="text-2xl font-semibold">{sentCount}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-status-caution" />
              <span className="text-xs text-muted-foreground">Scheduled</span>
            </div>
            <p className="text-2xl font-semibold">{scheduledCount}</p>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drafts</span>
            </div>
            <p className="text-2xl font-semibold">{draftCount}</p>
          </div>
        </div>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {scheduledEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              isSelected={selectedEmail === email.id}
              onClick={() => setSelectedEmail(email.id === selectedEmail ? null : email.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* AI Suggestions */}
      <div className="p-4 border-t border-border/50">
        <div className="panel-maritime border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Suggestion</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Port of Cozumel requires ISPS notification 72h before arrival. Would you like me to generate this email?
          </p>
          <Button size="sm" variant="outline" className="w-full gap-2">
            <Sparkles className="w-3 h-3" />
            Generate ISPS Notification
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmailCard({
  email,
  isSelected,
  onClick,
}: {
  email: (typeof scheduledEmails)[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusConfig = {
    sent: {
      icon: Check,
      color: "text-status-safe",
      bg: "bg-status-safe/10",
      border: "border-status-safe/30",
      label: "Sent",
    },
    scheduled: {
      icon: Clock,
      color: "text-status-caution",
      bg: "bg-status-caution/10",
      border: "border-status-caution/30",
      label: "Scheduled",
    },
    draft: {
      icon: FileText,
      color: "text-muted-foreground",
      bg: "bg-secondary",
      border: "border-border",
      label: "Draft",
    },
    failed: {
      icon: AlertCircle,
      color: "text-status-danger",
      bg: "bg-status-danger/10",
      border: "border-status-danger/30",
      label: "Failed",
    },
  };

  const config = statusConfig[email.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "panel-maritime p-4 cursor-pointer transition-all",
        config.border,
        isSelected && "ring-1 ring-primary"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
            <StatusIcon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h4 className="text-sm font-medium">{email.type}</h4>
            <p className="text-xs text-muted-foreground">{email.recipient}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {email.port}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {email.scheduledTime}
          </span>
        </div>

        {email.status === "scheduled" && email.hoursRemaining && (
          <div className="flex items-center gap-2">
            <span className="text-status-caution font-medium">{email.hoursRemaining}h remaining</span>
            <Button size="sm" variant="ghost" className="h-7 px-2">
              <Send className="w-3 h-3" />
            </Button>
          </div>
        )}

        {email.status === "sent" && (
          <span className={cn("flex items-center gap-1", config.color)}>
            <Check className="w-3 h-3" />
            Delivered
          </span>
        )}

        {email.status === "draft" && (
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1">
            Edit
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Paperclip className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Attachments:</span>
              <Badge variant="secondary" className="text-xs">Ship Particulars</Badge>
              <Badge variant="secondary" className="text-xs">Certificates</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Preview
              </Button>
              {email.status !== "sent" && (
                <Button size="sm" className="flex-1 gap-2">
                  <Send className="w-3 h-3" />
                  Send Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
