import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreateNewVoyageWidgetProps {
  onClick: () => void;
}

export function CreateNewVoyageWidget({ onClick }: CreateNewVoyageWidgetProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        "bg-gradient-to-br from-primary/20 via-primary/10 to-background",
        "border-2 border-primary/30",
        "h-[280px] flex flex-col items-center justify-center",
        "group"
      )}
    >
      {/* Ocean-themed background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          <Plus className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Plan a New Voyage</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Create a new route, plan communications, and run compliance checks.
          </p>
        </div>
      </div>
    </Card>
  );
}

