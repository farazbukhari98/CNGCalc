import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaybackPeriod } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

type FinancialAnalysisProps = {
  showCashflow: boolean;
};

export default function FinancialAnalysis({ showCashflow }: FinancialAnalysisProps) {
  const { results, timeHorizon, stationConfig } = useCalculator();

  // If no results yet, don't render anything
  if (!results) return null;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Prepare cash flow chart data
  const cashFlowData = Array.from({ length: timeHorizon }, (_, i) => {
    return {
      year: `Year ${i + 1}`,
      cumulativeInvestment: results.cumulativeInvestment[i],
      cumulativeSavings: results.cumulativeSavings[i]
    };
  });

  // Prepare cost vs savings chart data
  const costSavingsData = Array.from({ length: timeHorizon }, (_, i) => {
    const vehicleInvestment = results.vehicleDistribution[i]?.investment || 0;
    
    // For turnkey=yes: show station cost in first year only
    // For turnkey=no: don't show station cost upfront (it's financed)
    const stationCost = (i === 0 && stationConfig.turnkey) ? 
      (results.cumulativeInvestment[0] - vehicleInvestment) : 0;
    
    // For turnkey=no: calculate annual financing rate to display
    const monthlyFinancingRate = stationConfig.businessType === 'aglc' ? 0.015 : 0.016;
    const annualFinancingRate = monthlyFinancingRate * 12;
    
    // Get the calculated station cost
    // For year 0, the difference between total cumulative investment and vehicle investment gives us the station cost
    // We need this for accurate financing calculation
    const calculatedStationCost = (i === 0) ? 
      results.totalInvestment - results.vehicleDistribution[0].investment : 0;
    
    // For turnkey=no: calculate annual financing cost
    // For this to be accurate, we need to use the station cost from the results
    const financingCost = !stationConfig.turnkey ? 
      calculatedStationCost * annualFinancingRate : 0;
    
    return {
      year: `Year ${i + 1}`,
      vehicleInvestment: vehicleInvestment,
      stationInvestment: stationCost,
      financingCost: financingCost,
      savings: results.yearlySavings[i]
    };
  });

  // Format for Recharts tooltips
  const currencyFormatter = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Prepare data for year-by-year vehicle investment chart (only used when showCashflow is false)
  const vehicleInvestmentData = results.vehicleDistribution
    .map((yearData, index) => ({
      year: `Year ${index + 1}`,
      light: yearData.light,
      medium: yearData.medium,
      heavy: yearData.heavy,
      investment: yearData.investment,
    }))
    .filter(data => data.investment > 0); // Only show years with investments

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 financial-analysis">
      {/* Cash Flow Chart - Only show when showCashflow is true */}
      {showCashflow && (
        <Card className="bg-white rounded-lg shadow dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cash Flow Analysis</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={currencyFormatter} />
                  <RechartsTooltip formatter={currencyFormatter} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeInvestment" 
                    name="Cumulative Investment"
                    stroke="#ef4444" 
                    fill="rgba(239, 68, 68, 0.1)" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeSavings" 
                    name="Cumulative Savings"
                    stroke="#10b981" 
                    fill="rgba(16, 185, 129, 0.1)" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Payback Period</div>
                <div className={`text-lg font-bold ${results.paybackPeriod < 0 ? 'text-red-600' : results.paybackPeriod > 15 ? 'text-amber-600' : 'text-blue-600'}`}>
                  {formatPaybackPeriod(results.paybackPeriod)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Net Cash Flow ({timeHorizon}yr)</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(results.netCashFlow)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Year-by-year Vehicle Investment Chart (only when showCashflow is false) */}
      {!showCashflow && vehicleInvestmentData.length > 0 && (
        <Card className="bg-white rounded-lg shadow dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Investment Timeline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleInvestmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="count" orientation="left" label={{ value: 'Vehicle Count', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="investment" orientation="right" tickFormatter={currencyFormatter} />
                  <RechartsTooltip 
                    formatter={(value, name) => {
                      if (name === 'investment') return [formatCurrency(value as number), 'Investment'];
                      if (name === 'light') return [value, 'Light-Duty'];
                      if (name === 'medium') return [value, 'Medium-Duty']; 
                      if (name === 'heavy') return [value, 'Heavy-Duty'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="count"
                    dataKey="light" 
                    name="Light-Duty" 
                    fill="rgba(96, 165, 250, 0.7)" 
                    stackId="vehicles" 
                  />
                  <Bar 
                    yAxisId="count"
                    dataKey="medium" 
                    name="Medium-Duty" 
                    fill="rgba(52, 211, 153, 0.7)" 
                    stackId="vehicles" 
                  />
                  <Bar 
                    yAxisId="count"
                    dataKey="heavy" 
                    name="Heavy-Duty" 
                    fill="rgba(251, 146, 60, 0.7)" 
                    stackId="vehicles" 
                  />
                  <Bar 
                    yAxisId="investment"
                    dataKey="investment" 
                    name="Investment" 
                    fill="rgba(236, 72, 153, 0.8)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cost vs Savings Analysis */}
      <Card className="bg-white rounded-lg shadow dark:bg-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {showCashflow ? "Cost vs. Savings" : "Investment Analysis"}
          </h2>
          
          {/* Only show the bar chart when showCashflow is true */}
          {showCashflow ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costSavingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={currencyFormatter} />
                  <RechartsTooltip formatter={currencyFormatter} />
                  <Legend />
                  <Bar 
                    dataKey="vehicleInvestment" 
                    name="Vehicle Investment"
                    fill="rgba(239, 68, 68, 0.7)" 
                    stackId="investment"
                  />
                  <Bar 
                    dataKey="stationInvestment" 
                    name="Station Investment"
                    fill="rgba(59, 130, 246, 0.7)" 
                    stackId="investment"
                  />
                  {!stationConfig.turnkey && (
                    <Bar 
                      dataKey="financingCost" 
                      name="Financing Cost"
                      fill="rgba(101, 67, 33, 0.8)" 
                      stackId="expenses"
                    />
                  )}
                  <Bar 
                    dataKey="savings" 
                    name={stationConfig.turnkey ? "Savings" : "Net Savings"}
                    fill="rgba(16, 185, 129, 0.7)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            // When showCashflow is false, show simplified investment breakdown
            <div className="h-64 flex items-center justify-center">
              <div className="text-center w-full max-w-md">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatCurrency(results.totalInvestment)}
                </div>
                <div className="text-base text-gray-500 dark:text-gray-400 mb-5">
                  Total Capital Investment
                </div>
                
                <div className="flex justify-center gap-10 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                      {formatCurrency(results.vehicleDistribution[0].investment)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Vehicles ({Math.round((results.vehicleDistribution[0].investment / results.totalInvestment) * 100)}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                      {formatCurrency(results.totalInvestment - results.vehicleDistribution[0].investment)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Station ({Math.round(((results.totalInvestment - results.vehicleDistribution[0].investment) / results.totalInvestment) * 100)}%)
                    </div>
                  </div>
                </div>
                
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full max-w-md mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${Math.round((results.vehicleDistribution[0].investment / results.totalInvestment) * 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                  Per-Vehicle Cost: <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(results.totalInvestment / 
                      (results.vehicleDistribution[0].light + 
                       results.vehicleDistribution[0].medium + 
                       results.vehicleDistribution[0].heavy))}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Always show the payback period regardless of showCashflow value */}
            <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
              <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Payback Period</div>
              <div className={`text-lg font-bold ${results.paybackPeriod < 0 ? 'text-red-600' : results.paybackPeriod > 15 ? 'text-amber-600' : 'text-blue-600'}`}>
                {formatPaybackPeriod(results.paybackPeriod)}
              </div>
            </div>
            
            {/* Show ROI metrics only when showCashflow is true */}
            {showCashflow ? (
              <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">{timeHorizon}-Year ROI</div>
                <div className="text-lg font-bold text-green-600">{Math.round(results.roi)}%</div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Total Vehicles</div>
                <div className="text-lg font-bold text-blue-600">
                  {results.vehicleDistribution[0].light + 
                   results.vehicleDistribution[0].medium + 
                   results.vehicleDistribution[0].heavy}
                </div>
              </div>
            )}
            
            {/* Show Annual Rate of Return only when showCashflow is true */}
            {showCashflow && (
              <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Annual Rate of Return</div>
                <div className="text-lg font-bold text-blue-600">{results.annualRateOfReturn.toFixed(1)}%</div>
              </div>
            )}
            
            {/* Show financing information for non-turnkey option only when relevant */}
            {!stationConfig.turnkey && showCashflow && (
              <div className={`${showCashflow ? "col-span-2" : ""} p-3 rounded-lg border dark:bg-gray-800/50 dark:border-gray-700`} 
                style={{ 
                  backgroundColor: 'rgba(101, 67, 33, 0.1)', 
                  borderColor: 'rgba(101, 67, 33, 0.3)'
                }}>
                <div className="text-sm font-medium mb-1 dark:text-amber-200" style={{ color: '#654321' }}>
                  Financing Information (Non-TurnKey Option)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs dark:text-amber-300" style={{ color: '#755c3b' }}>Monthly Rate:</span>
                    <span className="text-sm font-semibold ml-1 dark:text-gray-200">
                      {(stationConfig.businessType === 'aglc' ? 1.5 : 1.6).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs dark:text-amber-300" style={{ color: '#755c3b' }}>Annual Cost:</span>
                    <span className="text-sm font-semibold ml-1 dark:text-gray-200">
                      {formatCurrency(costSavingsData[0].financingCost)}
                    </span>
                  </div>
                </div>
                <div className="text-xs mt-1 dark:text-amber-200" style={{ color: '#654321' }}>
                  Note: Station costs are not paid upfront but financed at monthly percentage rates.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
