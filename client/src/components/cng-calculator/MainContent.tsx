import { useState } from "react";
import { useCalculator } from "@/contexts/CalculatorContext";
import FleetConfiguration from "./FleetConfiguration";
import DeploymentTimeline from "./DeploymentTimeline";
import FinancialAnalysis from "./FinancialAnalysis";
import AdditionalMetrics from "./AdditionalMetrics";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";

export default function MainContent() {
  const { deploymentStrategy, results } = useCalculator();
  const [showCashflow, setShowCashflow] = useState(true);

  // Strategy titles and taglines
  const strategyTitles = {
    immediate: "Immediate Purchase Strategy",
    phased: "Phased Deployment Strategy",
    aggressive: "Aggressive Early Strategy",
    deferred: "Deferred Deployment Strategy",
    manual: "Custom Deployment Strategy"
  };

  const strategyTaglines = {
    immediate: "Full upfront investment for maximum savings potential",
    phased: "Balanced approach with steady investment over time",
    aggressive: "Front-loaded investment to accelerate savings",
    deferred: "Gradual deployment with heavier investment in later years",
    manual: "Customized deployment based on your specific needs"
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Strategy Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {strategyTitles[deploymentStrategy]}
            </h1>
            <p className="text-gray-600 mt-1">
              {strategyTaglines[deploymentStrategy]} • <span className="text-green-600 text-sm">Auto-updating</span>
            </p>
          </div>
          <div className="flex items-center mt-3 md:mt-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="cashflowToggle" className="mr-3 text-sm font-medium text-gray-700">
                Show Cash Flow
              </Label>
              <Switch
                id="cashflowToggle"
                checked={showCashflow}
                onCheckedChange={setShowCashflow}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content sections */}
      <FleetConfiguration />
      
      <DeploymentTimeline />
      
      {results && (
        <>
          <FinancialAnalysis showCashflow={showCashflow} />
          
          <AdditionalMetrics />
          
          {/* Export/Save Actions */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <Button variant="outline" className="inline-flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export PDF
            </Button>
            <Button className="inline-flex items-center bg-blue-600 hover:bg-blue-700">
              <Save className="h-5 w-5 mr-2" />
              Save Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
