import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTooltips } from "@/contexts/TooltipContext";

interface MetricInfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  affectingVariables?: string[];
  simpleDescription?: string; // Simple description when detailed tooltips are off
}

export function MetricInfoTooltip({
  title,
  description,
  calculation,
  affectingVariables,
  simpleDescription,
}: MetricInfoTooltipProps) {
  const { showDetailedTooltips } = useTooltips();
  
  // If simple description is not provided, use the full description
  const tooltipDescription = !showDetailedTooltips && simpleDescription 
    ? simpleDescription 
    : description;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center cursor-help ml-1">
            <Info size={16} className="text-gray-500 hover:text-gray-700" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className={showDetailedTooltips ? "max-w-md p-4" : "p-3"}>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-gray-600">{tooltipDescription}</p>
            
            {showDetailedTooltips && calculation && (
              <>
                <h5 className="font-medium text-xs mt-2">Calculation:</h5>
                <p className="text-xs text-gray-600">{calculation}</p>
              </>
            )}
            
            {showDetailedTooltips && affectingVariables && affectingVariables.length > 0 && (
              <>
                <h5 className="font-medium text-xs mt-2">Affecting Factors:</h5>
                <ul className="text-xs text-gray-600 list-disc pl-4">
                  {affectingVariables.map((variable, index) => (
                    <li key={index}>{variable}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}