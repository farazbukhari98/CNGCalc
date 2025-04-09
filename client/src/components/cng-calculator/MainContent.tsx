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
import MultiVariableAnalysis from "./MultiVariableAnalysis";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PanelLeft, PanelRight, Moon, Sun } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Deployment strategy titles and taglines
const strategyTitles = {
  immediate: "Immediate Deployment",
  phased: "Phased Deployment",
  aggressive: "Aggressive Deployment",
  deferred: "Deferred Deployment",
  manual: "Custom Deployment"
};

const strategyTaglines = {
  immediate: "Convert entire fleet to CNG immediately",
  phased: "Gradually convert fleet over time",
  aggressive: "Rapid initial conversion with follow-up phases",
  deferred: "Delay major conversion for initial testing",
  manual: "Customized deployment schedule"
};

export default function MainContent() {
  const { 
    deploymentStrategy, 
    results, 
    vehicleParameters, 
    stationConfig, 
    fuelPrices, 
    timeHorizon, 
    sidebarCollapsed, 
    toggleSidebar 
  } = useCalculator();
  
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showCashflow, setShowCashflow] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Function to handle high-quality PDF export with dedicated pages for each section
  const handleExportPDF = async () => {
    if (!results || !contentRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Create a date string for the report
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Initialize PDF document (A4 size in portrait for better quality)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set PDF metadata
      pdf.setProperties({
        title: 'CNG Fleet Analysis Report',
        subject: `${strategyTitles[deploymentStrategy]} Strategy Analysis`,
        author: 'CNG Fleet Calculator',
        keywords: 'CNG, Fleet, Analysis, Compressed Natural Gas',
        creator: 'CNG Fleet Calculator'
      });
      
      // Create title page
      pdf.setFontSize(24);
      pdf.setTextColor(darkMode ? 220 : 40);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CNG Fleet Analysis Report', 105, 40, { align: 'center' });
      
      // Strategy title
      pdf.setFontSize(18);
      pdf.setTextColor(darkMode ? 150 : 70);
      pdf.text(`${strategyTitles[deploymentStrategy]} Strategy`, 105, 60, { align: 'center' });
      
      // Strategy description
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(darkMode ? 180 : 80);
      pdf.text(strategyTaglines[deploymentStrategy], 105, 70, { align: 'center' });
      
      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated on ${date}`, 105, 85, { align: 'center' });
      
      // Key metrics on title page
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(darkMode ? 220 : 40);
      pdf.text('Key Financial Metrics', 105, 105, { align: 'center' });
      
      // Draw key metrics
      const leftCol = 60;
      const rightCol = 150;
      const startY = 120;
      const lineHeight = 15;
      
      // Labels
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(darkMode ? 180 : 80);
      
      pdf.text('Total Investment:', leftCol, startY);
      pdf.text('Annual Fuel Savings:', leftCol, startY + lineHeight);
      pdf.text('Net Cash Flow:', leftCol, startY + lineHeight * 2);
      pdf.text('ROI:', leftCol, startY + lineHeight * 3);
      pdf.text('Payback Period:', leftCol, startY + lineHeight * 4);
      pdf.text('CO₂ Reduction:', leftCol, startY + lineHeight * 5);
      
      // Values
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(darkMode ? 220 : 40);
      
      pdf.text(formatCurrency(results.totalInvestment), rightCol, startY);
      pdf.text(formatCurrency(results.annualFuelSavings), rightCol, startY + lineHeight);
      pdf.text(formatCurrency(results.netCashFlow), rightCol, startY + lineHeight * 2);
      pdf.text(`${Math.round(results.roi)}%`, rightCol, startY + lineHeight * 3);
      
      // Format payback period
      const formatPaybackPeriod = (paybackPeriod: number): string => {
        if (paybackPeriod === -1) return "Never";
        const years = Math.floor(paybackPeriod);
        const months = Math.round((paybackPeriod - years) * 12);
        if (years === 0 && months === 0) return "Immediate";
        
        let result = "";
        if (years > 0) result += `${years} Year${years !== 1 ? 's' : ''}`;
        if (months > 0) {
          if (result.length > 0) result += ", ";
          result += `${months} Month${months !== 1 ? 's' : ''}`;
        }
        return result;
      };
      
      pdf.text(formatPaybackPeriod(results.paybackPeriod), rightCol, startY + lineHeight * 4);
      pdf.text(`${results.co2Reduction.toLocaleString()} kg`, rightCol, startY + lineHeight * 5);
      
      // Fleet composition
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(darkMode ? 220 : 40);
      pdf.text('Fleet Composition', 105, 200, { align: 'center' });
      
      // Fleet labels and values
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(darkMode ? 180 : 80);
      
      pdf.text('Light-Duty Vehicles:', leftCol, 220);
      pdf.text('Medium-Duty Vehicles:', leftCol, 235);
      pdf.text('Heavy-Duty Vehicles:', leftCol, 250);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(darkMode ? 220 : 40);
      
      pdf.text(`${vehicleParameters.lightDutyCount}`, rightCol, 220);
      pdf.text(`${vehicleParameters.mediumDutyCount}`, rightCol, 235);
      pdf.text(`${vehicleParameters.heavyDutyCount}`, rightCol, 250);
      
      // Custom function to add component sections to PDF
      const addSectionToPDF = async (sectionId: string, title: string) => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Add a new page
        pdf.addPage();
        
        // Capture the section as an image
        const canvas = await html2canvas(section, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff'
        });
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Calculate aspect ratio to fit on PDF page
        const imgWidth = 190; // A4 width in mm (portrait) with margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add title
        pdf.setFontSize(16);
        pdf.setTextColor(darkMode ? 220 : 40);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 105, 15, { align: 'center' });
        
        // Add date
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on ${date}`, 105, 22, { align: 'center' });
        
        // Add image centered on page with margins
        pdf.addImage(imgData, 'JPEG', 10, 30, imgWidth, imgHeight);
        
        // Add page number
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Page ${pdf.getNumberOfPages()}`, 105, 290, { align: 'center' });
      };
      
      // Add component sections
      await addSectionToPDF('financial-analysis', 'Financial Analysis');
      await addSectionToPDF('deployment-timeline', 'Deployment Timeline');
      await addSectionToPDF('additional-metrics', 'Financial & Environmental Metrics');
      
      if (showCashflow) {
        await addSectionToPDF('cash-flow-section', 'Cash Flow Analysis');
      }
      
      await addSectionToPDF('sensitivity-analysis', 'Sensitivity Analysis');
      await addSectionToPDF('multi-variable-analysis', 'Multi-Variable Analysis');
      
      // Finalize and save the PDF
      pdf.save(`CNG_Fleet_Analysis_${strategyTitles[deploymentStrategy].replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      setIsExporting(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen text-foreground bg-background" ref={contentRef}>
      <div className="flex items-center justify-between p-2 border-b bg-card">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="sidebar-toggle"
          >
            {sidebarCollapsed ? <PanelRight size={20} /> : <PanelLeft size={20} />}
          </Button>
          <h1 className="text-xl font-bold md:text-2xl">CNG Fleet Calculator</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-cashflow" 
              checked={showCashflow} 
              onCheckedChange={setShowCashflow} 
            />
            <Label htmlFor="show-cashflow">Show Cashflow</Label>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button 
            onClick={handleExportPDF} 
            disabled={!results || isExporting} 
            className="flex items-center space-x-1"
          >
            <Download size={16} />
            <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {results ? (
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="w-full justify-start mb-4 overflow-x-auto">
              <TabsTrigger value="analysis">Financial Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Deployment Timeline</TabsTrigger>
              <TabsTrigger value="comparison">Strategy Comparison</TabsTrigger>
              <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
              <TabsTrigger value="multi-variable">Multi-Variable Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-6">
              <div id="financial-analysis">
                <FinancialAnalysis showCashflow={showCashflow} />
              </div>
              <div id="additional-metrics">
                <AdditionalMetrics showCashflow={showCashflow} />
              </div>
              <div id="deployment-timeline">
                <DeploymentTimeline />
              </div>
              {showCashflow && (
                <div id="cash-flow-section">
                  <FleetConfiguration showCashflow={showCashflow} />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline">
              <DeploymentTimeline />
            </TabsContent>
            
            <TabsContent value="comparison">
              <StrategyComparison />
            </TabsContent>
            
            <TabsContent value="sensitivity" id="sensitivity-analysis">
              <SensitivityAnalysis />
            </TabsContent>
            
            <TabsContent value="multi-variable" id="multi-variable-analysis">
              <MultiVariableAnalysis />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <h2 className="text-xl font-semibold mb-4">Welcome to the CNG Fleet Calculator</h2>
            <p className="max-w-md mb-8">
              Configure your fleet parameters in the sidebar and click "Calculate" to analyze the financial and environmental impact of converting to CNG.
            </p>
            <p className="text-sm">
              {sidebarCollapsed && (
                <Button 
                  variant="outline" 
                  onClick={toggleSidebar} 
                  className="flex items-center space-x-1"
                >
                  <PanelRight size={16} />
                  <span>Open Sidebar</span>
                </Button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}