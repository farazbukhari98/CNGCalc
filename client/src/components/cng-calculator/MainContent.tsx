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

export default function MainContent() {
  const { 
    deploymentStrategy, 
    results, 
    vehicleParameters, 
    timeHorizon, 
    sidebarCollapsed, 
    toggleSidebar 
  } = useCalculator();
  
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showCashflow, setShowCashflow] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Strategy display names and descriptions
  const strategyTitles: Record<string, string> = {
    immediate: "Immediate Deployment",
    phased: "Phased Deployment",
    aggressive: "Aggressive Deployment",
    deferred: "Deferred Deployment",
    manual: "Custom Deployment"
  };
  
  const strategyTaglines: Record<string, string> = {
    immediate: "Convert all vehicles to CNG at once for maximum impact",
    phased: "Steadily convert vehicles over time for balanced cash flow",
    aggressive: "Front-load conversions for early environmental benefits",
    deferred: "Delay major conversions to manage initial investment",
    manual: "Custom implementation schedule for specific needs"
  };
  
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
      
      // Import format function from utils
      const formatPaybackPeriod = (paybackPeriod: number): string => {
        if (paybackPeriod === -1) {
          return "Never";
        }
        
        const years = Math.floor(paybackPeriod);
        const months = Math.round((paybackPeriod - years) * 12);
        
        if (years === 0 && months === 0) {
          return "Immediate";
        }
        
        let result = "";
        if (years > 0) {
          result += `${years} Year${years !== 1 ? 's' : ''}`;
        }
        
        if (months > 0) {
          if (result.length > 0) {
            result += ", ";
          }
          result += `${months} Month${months !== 1 ? 's' : ''}`;
        }
        
        return result;
      };
      
      // Values
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(darkMode ? 220 : 40);
      
      pdf.text(formatCurrency(results.totalInvestment), rightCol, startY);
      pdf.text(formatCurrency(results.annualFuelSavings), rightCol, startY + lineHeight);
      pdf.text(formatCurrency(results.netCashFlow), rightCol, startY + lineHeight * 2);
      pdf.text(`${Math.round(results.roi)}%`, rightCol, startY + lineHeight * 3);
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
    <div className="flex-1 overflow-y-auto" ref={contentRef}>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">CNG Fleet Analysis</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="cashflow-mode" className="cursor-pointer">
                Show Cash Flow
              </Label>
              <Switch 
                id="cashflow-mode" 
                checked={showCashflow} 
                onCheckedChange={setShowCashflow} 
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode} 
              className="text-muted-foreground" 
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-muted-foreground"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelRight size={18} />}
            </Button>
            
            <Button 
              onClick={handleExportPDF} 
              className="flex items-center gap-2"
              disabled={isExporting || !results}
            >
              <Download size={16} /> 
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>
        
        {results ? (
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="analysis">Financial Analysis</TabsTrigger>
              <TabsTrigger value="deployment">Deployment Timeline</TabsTrigger>
              <TabsTrigger value="comparison">Strategy Comparison</TabsTrigger>
              <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
              <TabsTrigger value="multi-variable">Multi-Variable Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-8">
              <div id="financial-analysis">
                <FinancialAnalysis showCashflow={showCashflow} />
              </div>
              <div id="deployment-timeline">
                <DeploymentTimeline />
              </div>
              <div id="additional-metrics">
                <AdditionalMetrics showCashflow={showCashflow} />
              </div>
            </TabsContent>
            
            <TabsContent value="deployment">
              <div className="space-y-8">
                <DeploymentTimeline />
                <FleetConfiguration showCashflow={showCashflow} />
              </div>
            </TabsContent>
            
            <TabsContent value="comparison">
              <div className="space-y-8">
                <StrategyComparison />
              </div>
            </TabsContent>
            
            <TabsContent value="sensitivity">
              <div id="sensitivity-analysis">
                <SensitivityAnalysis />
              </div>
            </TabsContent>
            
            <TabsContent value="multi-variable">
              <div id="multi-variable-analysis">
                <MultiVariableAnalysis />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Configure Parameters to View Analysis</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Use the sidebar to set vehicle parameters, station configuration, and deployment strategy. 
              Click "Calculate Results" to generate your CNG fleet analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}