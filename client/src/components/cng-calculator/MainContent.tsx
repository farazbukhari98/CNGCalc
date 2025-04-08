import { useState } from "react";
import { useCalculator } from "@/contexts/CalculatorContext";
import { useComparison } from "@/contexts/ComparisonContext";
import FleetConfiguration from "./FleetConfiguration";
import DeploymentTimeline from "./DeploymentTimeline";
import FinancialAnalysis from "./FinancialAnalysis";
import AdditionalMetrics from "./AdditionalMetrics";
import StrategyComparison from "./StrategyComparison";
import SensitivityAnalysis from "./SensitivityAnalysis";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, PanelLeft, PanelRight } from "lucide-react";

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

  const { toggleSidebar, sidebarCollapsed } = useCalculator();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Strategy Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-transparent"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelRight className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {strategyTitles[deploymentStrategy]}
              </h1>
              <p className="text-gray-600 mt-1">
                {strategyTaglines[deploymentStrategy]} • <span className="text-green-600 text-sm">Auto-updating</span>
              </p>
            </div>
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
          
          {/* Advanced Analysis Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="w-full bg-gray-100 p-1 mb-4">
                <TabsTrigger value="comparison" className="flex-1 py-2">Strategy Comparison</TabsTrigger>
                <TabsTrigger value="sensitivity" className="flex-1 py-2">Sensitivity Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison" className="mt-0">
                <StrategyComparison />
              </TabsContent>
              
              <TabsContent value="sensitivity" className="mt-0">
                <SensitivityAnalysis />
              </TabsContent>
            </Tabs>
          </div>
          
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
