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
    if (!results) return;
    
    try {
      setIsExporting(true);
      
      // Create a date string for the report
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Initialize PDF document (A4 size in landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title page
      pdf.setFillColor(darkMode ? 35 : 240, darkMode ? 41 : 245, darkMode ? 47 : 250);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Header
      pdf.setFontSize(26);
      pdf.setTextColor(darkMode ? 255 : 0, darkMode ? 255 : 0, darkMode ? 255 : 0);
      pdf.text('CNG Fleet Analysis Report', margin, margin + 10);
      
      // Strategy information
      pdf.setFontSize(16);
      pdf.setTextColor(darkMode ? 200 : 80, darkMode ? 200 : 80, darkMode ? 200 : 80);
      pdf.text(`${strategyTitles[deploymentStrategy]}`, margin, margin + 20);
      pdf.setFontSize(12);
      pdf.text(`${strategyTaglines[deploymentStrategy]}`, margin, margin + 26);
      
      // Generate date
      pdf.text(`Generated on ${date}`, margin, margin + 34);
      
      // Fleet information box
      const boxY = margin + 45;
      pdf.setDrawColor(darkMode ? 70 : 200, darkMode ? 70 : 200, darkMode ? 70 : 200);
      pdf.setFillColor(darkMode ? 50 : 245, darkMode ? 55 : 250, darkMode ? 60 : 255);
      pdf.roundedRect(margin, boxY, contentWidth / 2 - 5, 40, 3, 3, 'FD');
      
      // Fleet details
      pdf.setTextColor(darkMode ? 255 : 0, darkMode ? 255 : 0, darkMode ? 255 : 0);
      pdf.setFontSize(12);
      pdf.text('Fleet Composition:', margin + 5, boxY + 10);
      pdf.setFontSize(10);
      pdf.text(`Light-Duty Vehicles: ${vehicleParameters.lightDutyCount}`, margin + 10, boxY + 18);
      pdf.text(`Medium-Duty Vehicles: ${vehicleParameters.mediumDutyCount}`, margin + 10, boxY + 25);
      pdf.text(`Heavy-Duty Vehicles: ${vehicleParameters.heavyDutyCount}`, margin + 10, boxY + 32);
      
      // Station information box
      pdf.setDrawColor(darkMode ? 70 : 200, darkMode ? 70 : 200, darkMode ? 70 : 200);
      pdf.setFillColor(darkMode ? 50 : 245, darkMode ? 55 : 250, darkMode ? 60 : 255);
      pdf.roundedRect(margin + contentWidth / 2 + 5, boxY, contentWidth / 2 - 5, 40, 3, 3, 'FD');
      
      // Station details
      pdf.setTextColor(darkMode ? 255 : 0, darkMode ? 255 : 0, darkMode ? 255 : 0);
      pdf.setFontSize(12);
      pdf.text('Station Configuration:', margin + contentWidth / 2 + 10, boxY + 10);
      pdf.setFontSize(10);
      pdf.text(`Type: ${stationConfig.stationType === 'fast' ? 'Fast-Fill' : 'Time-Fill'}`, margin + contentWidth / 2 + 15, boxY + 18);
      pdf.text(`Business Type: ${stationConfig.businessType === 'aglc' ? 'Alternative Gas & Light Company' : 'Clean Gas Corporation'}`, margin + contentWidth / 2 + 15, boxY + 25);
      pdf.text(`Payment Option: ${stationConfig.turnkey ? 'TurnKey (Upfront)' : 'Financed'}`, margin + contentWidth / 2 + 15, boxY + 32);
      
      // Key Metrics
      const boxY2 = boxY + 50;
      pdf.setDrawColor(darkMode ? 70 : 200, darkMode ? 70 : 200, darkMode ? 70 : 200);
      pdf.setFillColor(darkMode ? 50 : 245, darkMode ? 55 : 250, darkMode ? 60 : 255);
      pdf.roundedRect(margin, boxY2, contentWidth, 45, 3, 3, 'FD');
      
      // Metrics header
      pdf.setTextColor(darkMode ? 255 : 0, darkMode ? 255 : 0, darkMode ? 255 : 0);
      pdf.setFontSize(14);
      pdf.text('Key Financial & Environmental Metrics', margin + 5, boxY2 + 10);
      
      // Create two columns of metrics
      const metrics = [
        { name: 'Total Investment', value: `$${results.totalInvestment.toLocaleString()}` },
        { name: 'Payback Period', value: results.paybackPeriod < 0 ? 'Never' : `${Math.floor(results.paybackPeriod)} years, ${Math.round((results.paybackPeriod % 1) * 12)} months` },
        { name: 'ROI', value: `${Math.round(results.roi)}%` },
        { name: 'Annual Rate of Return', value: `${results.annualRateOfReturn.toFixed(1)}%` },
        { name: 'Annual Fuel Savings', value: `$${results.annualFuelSavings.toLocaleString()}` },
        { name: 'Net Cash Flow', value: `$${results.netCashFlow.toLocaleString()}` },
        { name: 'CO₂ Reduction', value: `${results.co2Reduction.toLocaleString()} kg` },
        { name: 'Cost Per Mile (Gasoline)', value: `$${results.costPerMileGasoline.toFixed(3)}` },
        { name: 'Cost Per Mile (CNG)', value: `$${results.costPerMileCNG.toFixed(3)}` },
        { name: 'Cost Reduction', value: `${results.costReduction.toFixed(1)}%` }
      ];
      
      // Layout metrics in two columns
      const colWidth = contentWidth / 2 - 10;
      pdf.setFontSize(10);
      metrics.forEach((metric, index) => {
        const col = index < 5 ? 0 : 1;
        const row = index % 5;
        const x = margin + 5 + (col * colWidth);
        const y = boxY2 + 20 + (row * 7);
        
        pdf.setTextColor(darkMode ? 200 : 80, darkMode ? 200 : 80, darkMode ? 200 : 80);
        pdf.text(metric.name + ':', x, y);
        
        pdf.setTextColor(darkMode ? 255 : 0, darkMode ? 255 : 0, darkMode ? 255 : 0);
        pdf.text(metric.value, x + 60, y);
      });
      
      // Add a second page for charts and analytics
      pdf.addPage();
      
      // Page heading
      pdf.setFillColor(darkMode ? 35 : 240, darkMode ? 41 : 245, darkMode ? 47 : 250);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFontSize(18);
      pdf.setTextColor(darkMode ? 255 : 0, darkMode ? 255 : 0, darkMode ? 255 : 0);
      pdf.text('Analysis Charts & Deployment Timeline', margin, margin + 10);
      
      // Capture the financial analysis card
      const financialEl = document.querySelector('.financial-analysis');
      if (financialEl) {
        const canvas = await html2canvas(financialEl as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff'
        });
        
        const imgWidth = contentWidth / 2 - 5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin + 15, imgWidth, imgHeight);
      }
      
      // Capture the deployment timeline
      const timelineEl = document.querySelector('.deployment-timeline');
      if (timelineEl) {
        const canvas = await html2canvas(timelineEl as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff'
        });
        
        const imgWidth = contentWidth / 2 - 5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin + contentWidth / 2 + 5, margin + 15, imgWidth, imgHeight);
      }
      
      // Capture the additional metrics
      const metricsEl = document.querySelector('.additional-metrics');
      if (metricsEl) {
        const canvas = await html2canvas(metricsEl as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff'
        });
        
        const imgWidth = contentWidth / 2 - 5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if we need to go to a new page
        const currentY = margin + 15 + 70; // Estimate height of previous charts
        const newImgHeight = Math.min(imgHeight, pageHeight - currentY - margin);
        
        if (currentY + newImgHeight > pageHeight - margin) {
          pdf.addPage();
          pdf.setFillColor(darkMode ? 35 : 240, darkMode ? 41 : 245, darkMode ? 47 : 250);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin + 10, imgWidth, imgHeight);
        } else {
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, currentY, imgWidth, imgHeight);
        }
      }
      
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
