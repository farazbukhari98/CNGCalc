import { HelpCircle } from "lucide-react";
import { useTooltips } from "@/contexts/TooltipContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipToggle() {
  const { showDetailedTooltips, toggleDetailedTooltips } = useTooltips();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDetailedTooltips}
            className={showDetailedTooltips ? "bg-blue-100 text-blue-700" : ""}
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">
              {showDetailedTooltips ? "Disable detailed tooltips" : "Enable detailed tooltips"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{showDetailedTooltips ? "Disable detailed tooltips" : "Enable detailed tooltips"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}