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
      
      // Helper function to format payback period
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
         .fontSize(18)
         .fillColor(textColor)
         .text('Financial Analysis', 50, 30);
      
      // Draw investment breakdown
      doc.roundedRect(50, 90, doc.page.width - 100, 180, 5)
         .lineWidth(1)
         .fillAndStroke(boxBgColor, boxBorderColor);
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(textColor)
         .text('Investment Breakdown', 70, 110);
      
      doc.font('Helvetica-Bold')
         .fontSize(20)
         .fillColor(accentColor)
         .text(formatCurrency(results.totalInvestment), doc.page.width / 2, 140, { align: 'center' });
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(subtitleColor)
         .text('Total Capital Investment', doc.page.width / 2, 165, { align: 'center' });
      
      // Draw pie chart sections for vehicle and station investment
      const vehicleInvestment = results.vehicleDistribution[0].investment;
      const stationInvestment = results.totalInvestment - vehicleInvestment;
      const vehiclePercent = Math.round((vehicleInvestment / results.totalInvestment) * 100);
      const stationPercent = 100 - vehiclePercent;
      
      // Draw vehicle investment section
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(textColor);
      
      doc.text('Vehicles', 150, 200);
      doc.font('Helvetica')
         .fontSize(12)
         .text(formatCurrency(vehicleInvestment), 150, 220);
      doc.text(`${vehiclePercent}%`, 150, 240);
      
      // Color square for vehicles
      doc.rect(120, 200, 15, 15)
         .fill(accentColor);
      
      // Draw station investment section
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(textColor);
      
      doc.text('Station', 350, 200);
      doc.font('Helvetica')
         .fontSize(12)
         .text(formatCurrency(stationInvestment), 350, 220);
      doc.text(`${stationPercent}%`, 350, 240);
      
      // Color square for station
      doc.rect(320, 200, 15, 15)
         .fill(secondaryColor);
      
      // Cash flow and savings trends
      doc.roundedRect(50, 290, doc.page.width - 100, 220, 5)
         .lineWidth(1)
         .fillAndStroke(boxBgColor, boxBorderColor);
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(textColor)
         .text('Financial Projections', 70, 310);
      
      // Draw simplified chart
      const chartX = 70;
      const chartY = 340;
      const chartWidth = doc.page.width - 140;
      const chartHeight = 150;
      
      // Draw chart axes
      doc.moveTo(chartX, chartY)
         .lineTo(chartX, chartY + chartHeight)
         .lineTo(chartX + chartWidth, chartY + chartHeight)
         .stroke();
      
      // Draw investment and savings lines
      const maxYear = results.yearlySavings.length;
      const yearWidth = chartWidth / maxYear;
      
      // Draw year markers
      for (let i = 0; i < maxYear; i++) {
        const x = chartX + i * yearWidth;
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor(subtitleColor)
           .text(`Year ${i + 1}`, x, chartY + chartHeight + 10, { width: yearWidth, align: 'center' });
      }
      
      // Find the maximum value for scaling
      const maxSavings = Math.max(...results.cumulativeSavings);
      const maxInvestment = Math.max(...results.cumulativeInvestment);
      const maxValue = Math.max(maxSavings, maxInvestment);
      
      // Draw investment line
      doc.moveTo(chartX, chartY + chartHeight);
      for (let i = 0; i < results.cumulativeInvestment.length; i++) {
        const x = chartX + i * yearWidth;
        const y = chartY + chartHeight - (results.cumulativeInvestment[i] / maxValue) * chartHeight;
        if (i === 0) {
          doc.moveTo(x, y);
        } else {
          doc.lineTo(x, y);
        }
      }
      doc.strokeColor(accentColor)
         .lineWidth(2)
         .stroke();
      
      // Draw savings line
      doc.moveTo(chartX, chartY + chartHeight);
      for (let i = 0; i < results.cumulativeSavings.length; i++) {
        const x = chartX + i * yearWidth;
        const y = chartY + chartHeight - (results.cumulativeSavings[i] / maxValue) * chartHeight;
        if (i === 0) {
          doc.moveTo(x, y);
        } else {
          doc.lineTo(x, y);
        }
      }
      doc.strokeColor(secondaryColor)
         .lineWidth(2)
         .stroke();
      
      // Chart legend
      doc.rect(70, 510, 15, 10)
         .fill(accentColor);
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor(textColor)
         .text('Cumulative Investment', 90, 510);
      
      doc.rect(230, 510, 15, 10)
         .fill(secondaryColor);
      doc.text('Cumulative Savings', 250, 510);
      
      // Metrics grid
      doc.roundedRect(50, 530, doc.page.width - 100, 120, 5)
         .lineWidth(1)
         .fillAndStroke(boxBgColor, boxBorderColor);
      
      // Financial metrics grid layout
      const metricItems = [
        { label: 'Payback Period', value: formatPaybackPeriod(results.paybackPeriod) },
        { label: `${timeHorizon}-Year ROI`, value: `${Math.round(results.roi)}%` },
        { label: 'Annual Rate of Return', value: `${results.annualRateOfReturn.toFixed(1)}%` },
        { label: 'Net Cash Flow', value: formatCurrency(results.netCashFlow) }
      ];
      
      // Draw metrics grid
      const gridCols = 2;
      const gridRows = Math.ceil(metricItems.length / gridCols);
      const cellWidth = (doc.page.width - 100) / gridCols;
      const cellHeight = 120 / gridRows;
      
      metricItems.forEach((item, index) => {
        const row = Math.floor(index / gridCols);
        const col = index % gridCols;
        const x = 50 + col * cellWidth + 20;
        const y = 530 + row * cellHeight + 15;
        
        doc.font('Helvetica')
           .fontSize(11)
           .fillColor(subtitleColor)
           .text(item.label, x, y);
        
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor(textColor)
           .text(item.value, x, y + 20);
      });
      
      // ==================== DEPLOYMENT TIMELINE PAGE ====================
      doc.addPage();
      
      // Page background
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill(bgColor);
      
      // Header bar
      doc.rect(0, 0, doc.page.width, 70)
         .fill(headerBgColor);
      
      // Page header
      doc.font('Helvetica-Bold')
         .fontSize(18)
         .fillColor(textColor)
         .text('Deployment Timeline', 50, 30);
      
      // Draw timeline header
      doc.roundedRect(50, 90, doc.page.width - 100, 60, 5)
         .lineWidth(1)
         .fillAndStroke(accentColor, accentColor);
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor('#ffffff')
         .text(`${strategyTitles[deploymentStrategy]} - ${timeHorizon} Year Plan`, 70, 110);
      
      doc.font('Helvetica')
         .fontSize(12)
         .text(strategyTaglines[deploymentStrategy], 70, 130);
      
      // Draw timeline for each year
      const years = results.vehicleDistribution.length;
      const timelineYears = Math.min(years, 10); // Display up to 10 years
      
      for (let year = 0; year < timelineYears; year++) {
        const dist = results.vehicleDistribution[year];
        const yPos = 170 + year * 60;
        
        // Year background
        doc.roundedRect(50, yPos, doc.page.width - 100, 50, 5)
           .lineWidth(1)
           .fillAndStroke(boxBgColor, boxBorderColor);
        
        // Year header
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor(textColor)
           .text(`Year ${year + 1}`, 70, yPos + 15);
        
        // Vehicle counts
        const lightLabel = `Light-Duty: ${dist.light}`;
        const mediumLabel = `Medium-Duty: ${dist.medium}`;
        const heavyLabel = `Heavy-Duty: ${dist.heavy}`;
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(subtitleColor);
        
        doc.text(lightLabel, 170, yPos + 10);
        doc.text(mediumLabel, 170, yPos + 25);
        doc.text(heavyLabel, 170, yPos + 40);
        
        // Investment and savings
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(accentColor)
           .text(`Investment: ${formatCurrency(dist.investment)}`, 300, yPos + 15);
        
        if (year > 0) {
          doc.fillColor(secondaryColor)
             .text(`Savings: ${formatCurrency(results.yearlySavings[year])}`, 300, yPos + 35);
        }
      }
      
      // Draw summary at the bottom
      const summaryY = 170 + timelineYears * 60 + 20;
      
      doc.roundedRect(50, summaryY, doc.page.width - 100, 80, 5)
         .lineWidth(1)
         .fillAndStroke(headerBgColor, boxBorderColor);
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(textColor)
         .text('Deployment Summary', 70, summaryY + 15);
      
      // Total vehicles deployed
      const totalLight = results.vehicleDistribution.reduce((sum, year) => sum + year.light, 0);
      const totalMedium = results.vehicleDistribution.reduce((sum, year) => sum + year.medium, 0);
      const totalHeavy = results.vehicleDistribution.reduce((sum, year) => sum + year.heavy, 0);
      
      doc.font('Helvetica')
         .fontSize(11)
         .fillColor(textColor);
      
      doc.text(`Total Vehicles: ${totalLight + totalMedium + totalHeavy}`, 70, summaryY + 40);
      doc.text(`Total Investment: ${formatCurrency(results.totalInvestment)}`, 280, summaryY + 40);
      doc.text(`Net Cash Flow: ${formatCurrency(results.netCashFlow)}`, 280, summaryY + 55);
      
      // ==================== ENVIRONMENTAL IMPACT PAGE ====================
      doc.addPage();
      
      // Page background
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill(bgColor);
      
      // Header bar
      doc.rect(0, 0, doc.page.width, 70)
         .fill(headerBgColor);
      
      // Page header
      doc.font('Helvetica-Bold')
         .fontSize(18)
         .fillColor(textColor)
         .text('Environmental Impact', 50, 30);
      
      // CO2 Reduction box
      doc.roundedRect(50, 90, doc.page.width - 100, 160, 5)
         .lineWidth(1)
         .fillAndStroke(boxBgColor, boxBorderColor);
      
      // Key emission statistics
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(textColor)
         .text('CO₂ Emissions Reduction', 70, 110);
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(subtitleColor)
         .text('Estimated reduction in carbon dioxide emissions over time', 70, 130);
      
      // Total emissions saved
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor(secondaryColor)
         .text(`${results.totalEmissionsSaved.toLocaleString()} kg`, doc.page.width / 2, 160, { align: 'center' });
      
      doc.font('Helvetica')
         .fontSize(14)
         .fillColor(textColor)
         .text('Total CO₂ Emissions Saved', doc.page.width / 2, 190, { align: 'center' });
      
      // CO2 reduction percentage
      const co2ReductionPercent = Math.round(results.costReduction);
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(secondaryColor)
         .text(`${co2ReductionPercent}%`, 150, 220);
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(textColor)
         .text('CO₂ Reduction Percentage', 150, 240);
      
      // Environmental equivalents
      const treeEquivalent = Math.round(results.totalEmissionsSaved / 21); // Average tree absorbs 21kg CO2 per year
      const forestAcres = Math.round(treeEquivalent / 120); // About 120 trees per acre in an average forest
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(secondaryColor)
         .text(`${treeEquivalent.toLocaleString()} trees`, 350, 220);
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(textColor)
         .text('Equivalent Trees Planted', 350, 240);
      
      // Emissions chart box
      doc.roundedRect(50, 270, doc.page.width - 100, 250, 5)
         .lineWidth(1)
         .fillAndStroke(boxBgColor, boxBorderColor);
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(textColor)
         .text('Emissions Reduction Over Time', 70, 290);
      
      // Draw simplified chart
      const emisChartX = 70;
      const emisChartY = 320;
      const emisChartWidth = doc.page.width - 140;
      const emisChartHeight = 150;
      
      // Draw chart axes
      doc.moveTo(emisChartX, emisChartY)
         .lineTo(emisChartX, emisChartY + emisChartHeight)
         .lineTo(emisChartX + emisChartWidth, emisChartY + emisChartHeight)
         .stroke();
      
      // Draw yearly emission bars
      const maxEmission = Math.max(...results.yearlyEmissionsSaved);
      const barWidth = emisChartWidth / results.yearlyEmissionsSaved.length - 10;
      
      results.yearlyEmissionsSaved.forEach((emission, index) => {
        const x = emisChartX + index * (barWidth + 10) + 5;
        const barHeight = (emission / maxEmission) * emisChartHeight;
        const y = emisChartY + emisChartHeight - barHeight;
        
        doc.rect(x, y, barWidth, barHeight)
           .fillOpacity(0.7)
           .fill(secondaryColor);
        
        // Year label
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor(subtitleColor)
           .fillOpacity(1)
           .text(`Year ${index + 1}`, x, emisChartY + emisChartHeight + 10, { width: barWidth, align: 'center' });
        
        // Only show values for bars high enough to display text
        if (barHeight > 20) {
          doc.font('Helvetica')
             .fontSize(8)
             .fillColor(textColor)
             .text(`${Math.round(emission).toLocaleString()}`, x, y - 15, { width: barWidth, align: 'center' });
        }
      });
      
      // Chart legend
      doc.rect(70, 490, 15, 10)
         .fill(secondaryColor);
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor(textColor)
         .text('Yearly CO₂ Emissions Saved (kg)', 90, 490);
      
      // Cost analysis box
      doc.roundedRect(50, 530, doc.page.width - 100, 120, 5)
         .lineWidth(1)
         .fillAndStroke(boxBgColor, boxBorderColor);
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(textColor)
         .text('Cost Per Mile Comparison', 70, 550);
      
      // Cost comparison boxes
      doc.rect(80, 580, 180, 60)
         .lineWidth(1)
         .fillAndStroke('#fff5f5', '#fecaca'); // Light red for gasoline
      
      doc.rect(300, 580, 180, 60)
         .lineWidth(1)
         .fillAndStroke('#f0fdf4', '#86efac'); // Light green for CNG
      
      // Gasoline cost
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#dc2626') // Red
         .text('Gasoline Cost Per Mile', 100, 590);
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .text(`$${results.costPerMileGasoline.toFixed(3)}`, 100, 610);
      
      // CNG cost
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#16a34a') // Green
         .text('CNG Cost Per Mile', 320, 590);
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .text(`$${results.costPerMileCNG.toFixed(3)}`, 320, 610);
      
      // Finish and save the PDF
      doc.end();
      
      // When the stream is done, create a blob and save it
      stream.on('finish', function() {
        const blob = stream.toBlob('application/pdf');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CNG_Analysis_${deploymentStrategy}_${date.replace(/[\s,]+/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
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
