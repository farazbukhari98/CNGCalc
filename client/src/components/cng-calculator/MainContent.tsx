import { useState, useRef } from "react";
import { useCalculator } from "@/contexts/CalculatorContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
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
import { Download, PanelLeft, PanelRight, Moon, Sun } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function MainContent() {
  const { deploymentStrategy, results, vehicleParameters, stationConfig, fuelPrices, timeHorizon } = useCalculator();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showCashflow, setShowCashflow] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Function to handle PDF export
  const handleExportPDF = async () => {
    if (!contentRef.current || !results) return;
    
    try {
      setIsExporting(true);
      
      // Create a report title with the current date
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Initialize PDF document (A4 size)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add report header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`CNG Fleet Analysis Report`, 20, 20);
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${strategyTitles[deploymentStrategy]} | Generated on ${date}`, 20, 30);
      
      // Draw a separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 35, 190, 35);
      
      // Capture the main content as an image
      const canvas = await html2canvas(contentRef.current, {
        scale: 1.5, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff'
      });
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate aspect ratio to fit in PDF
      const imgWidth = 170; // Width in mm (A4 width = 210mm, with margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to PDF
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      
      // Add summary information at the bottom
      const pageHeight = pdf.internal.pageSize.height;
      let yPos = 40 + imgHeight + 10; // Position after image
      
      // If we're near the bottom of the page, add a new page
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Add summary table
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Summary of Key Metrics', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      
      // Create a summary table of key metrics
      const metrics = [
        { name: 'Total Investment', value: `$${results.totalInvestment.toLocaleString()}` },
        { name: 'Payback Period', value: results.paybackPeriod < 0 ? 'Never' : `${Math.floor(results.paybackPeriod)} years, ${Math.round((results.paybackPeriod % 1) * 12)} months` },
        { name: 'ROI', value: `${Math.round(results.roi)}%` },
        { name: 'Annual Fuel Savings', value: `$${results.annualFuelSavings.toLocaleString()}` },
        { name: 'CO₂ Reduction', value: `${results.co2Reduction.toLocaleString()} kg` },
        { name: 'Cost Per Mile Reduction', value: `${results.costReduction.toFixed(1)}%` }
      ];
      
      metrics.forEach((metric, index) => {
        pdf.text(metric.name, 25, yPos + (index * 7));
        pdf.text(metric.value, 100, yPos + (index * 7));
      });
      
      // Save the PDF with a descriptive filename
      pdf.save(`CNG_Analysis_${deploymentStrategy}_${date.replace(/[\s,]+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
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
          <div className="flex items-center mt-3 md:mt-0 space-x-6">
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
            <div className="flex items-center space-x-2">
              <Label htmlFor="darkModeToggle" className="mr-3 text-sm font-medium text-gray-700">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Label>
              <Switch
                id="darkModeToggle"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="dark-mode-transition"
              />
              <span className="ml-1">
                {darkMode ? (
                  <Sun size={18} className="text-amber-500" />
                ) : (
                  <Moon size={18} className="text-blue-800" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content sections */}
      <FleetConfiguration showCashflow={showCashflow} />
      
      <DeploymentTimeline />
      
      {results && (
        <>
          <FinancialAnalysis showCashflow={showCashflow} />
          
          <AdditionalMetrics showCashflow={showCashflow} />
          
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
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
