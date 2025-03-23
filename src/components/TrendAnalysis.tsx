
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Calendar,
  BarChart4
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SalesRecord } from '@/utils/mockData';
import { getSeasonalData } from '@/utils/mockData';
import { detectSeasonality, calculateYoYGrowth } from '@/utils/dataProcessing';

interface TrendAnalysisProps {
  data: SalesRecord[];
  analysisType?: 'seasonal' | 'growth';
  showAllAnalysis?: boolean;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ 
  data, 
  analysisType = 'seasonal',
  showAllAnalysis = false 
}) => {
  const [activeTab, setActiveTab] = useState<string>(analysisType);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Get seasonal data
  const seasonalData = getSeasonalData(data);
  const seasonalPatterns = detectSeasonality(data);
  
  // Get growth data
  const growthData = calculateYoYGrowth(data);
  
  // Colors for charts
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#a855f7', '#2563eb'];
  
  // Seasonal analysis
  const renderSeasonalAnalysis = () => {
    // Group by season and calculate average for each year
    const quarterlyData = seasonalData.reduce((acc, item) => {
      if (!acc[item.quarter]) {
        acc[item.quarter] = {
          quarter: item.quarter,
          sales: [],
          averageSales: 0
        };
      }
      acc[item.quarter].sales.push(item.sales);
      return acc;
    }, {} as Record<string, { quarter: string; sales: number[]; averageSales: number }>);
    
    // Calculate average sales for each quarter
    Object.keys(quarterlyData).forEach(quarter => {
      const sum = quarterlyData[quarter].sales.reduce((a, b) => a + b, 0);
      quarterlyData[quarter].averageSales = sum / quarterlyData[quarter].sales.length;
    });
    
    // Convert to array and sort by quarter
    const quarterAverages = Object.values(quarterlyData).map(q => ({
      quarter: q.quarter,
      averageSales: q.averageSales
    })).sort((a, b) => {
      // Sort quarters in order: Q1, Q2, Q3, Q4
      return a.quarter.localeCompare(b.quarter);
    });
    
    // Find highest and lowest quarters
    const highestQuarter = [...quarterAverages].sort((a, b) => b.averageSales - a.averageSales)[0];
    const lowestQuarter = [...quarterAverages].sort((a, b) => a.averageSales - b.averageSales)[0];
    
    // Transform into chart data
    const chartData = seasonalData.map(item => ({
      ...item,
      formattedQuarter: `${item.quarter} ${item.year}`
    }));
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seasonal Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonalPatterns}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="quarter" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar 
                      dataKey="averageSales" 
                      name="Average Sales" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    >
                      {seasonalPatterns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Season:</span>
                  <span className="font-medium flex items-center">
                    {highestQuarter.quarter}
                    <ArrowUpRight className="h-4 w-4 ml-1 text-green-500" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Season:</span>
                  <span className="font-medium flex items-center">
                    {lowestQuarter.quarter}
                    <ArrowDownRight className="h-4 w-4 ml-1 text-red-500" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Seasonality Strength:</span>
                  <span className="font-medium">
                    {((highestQuarter.averageSales - lowestQuarter.averageSales) / 
                      ((highestQuarter.averageSales + lowestQuarter.averageSales) / 2) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quarterly Sales by Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="formattedQuarter" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <Alert className="mt-4 bg-primary/5 border-primary/20">
                <Calendar className="h-4 w-4 text-primary" />
                <AlertTitle>Seasonal Insight</AlertTitle>
                <AlertDescription className="text-sm">
                  {highestQuarter.quarter === 'Q4' ? 
                    'Holiday season shows the strongest sales performance, suggesting potential for holiday-specific pricing strategies.' :
                    `${highestQuarter.quarter} consistently outperforms other quarters, indicating a seasonal purchasing pattern.`
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        {showAllAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Year-by-Year Seasonal Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="formattedQuarter" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="sales" 
                      name="Quarterly Sales" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry) => {
                        // Assign color based on quarter
                        const quarterIndex = parseInt(entry.quarter.substring(1)) - 1;
                        return <Cell key={`cell-${entry.formattedQuarter}`} fill={colors[quarterIndex]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
                  <div key={quarter} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <span className="text-sm">{quarter}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  // Growth analysis
  const renderGrowthAnalysis = () => {
    // Find the latest year growth
    const latestYearGrowth = growthData.length > 1 ? 
      growthData[growthData.length - 1].growth : 0;
    
    // Calculate average growth
    const totalGrowth = growthData.reduce((sum, item) => sum + item.growth, 0);
    const averageGrowth = growthData.length > 1 ? 
      totalGrowth / (growthData.length - 1) : 0;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Year-over-Year Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'sales') return formatCurrency(Number(value));
                        if (name === 'growth') return `${value}%`;
                        return value;
                      }}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="sales" 
                      name="Sales" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="growth" 
                      name="Growth %" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Latest Growth:</span>
                  <span className={`font-medium flex items-center ${latestYearGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {latestYearGrowth.toFixed(1)}%
                    {latestYearGrowth >= 0 ? 
                      <ArrowUpRight className="h-4 w-4 ml-1" /> : 
                      <ArrowDownRight className="h-4 w-4 ml-1" />
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Growth:</span>
                  <span className={`font-medium ${averageGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {averageGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growth Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData.filter(d => d.growth !== 0)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value) => `${value}%`}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      name="Growth %" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <Alert className="mt-4 bg-primary/5 border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
                <AlertTitle>Growth Insight</AlertTitle>
                <AlertDescription className="text-sm">
                  {latestYearGrowth > averageGrowth ? 
                    'Recent growth is outpacing historical averages, suggesting potential market expansion or increased product adoption.' :
                    'Growth is slowing compared to historical averages, which may indicate market saturation or increased competition.'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        {showAllAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cumulative Growth Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      name="Annual Sales" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    >
                      {growthData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.growth > 0 ? '#10b981' : '#ef4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                  <span className="text-sm">Positive Growth</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                  <span className="text-sm">Negative Growth</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  // Combined analysis (for expanded view)
  const renderCombinedAnalysis = () => {
    return (
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="seasonal" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Seasonal Analysis
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Growth Analysis
          </TabsTrigger>
          <TabsTrigger value="combined" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" />
            Combined View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="seasonal">
          {renderSeasonalAnalysis()}
        </TabsContent>
        
        <TabsContent value="growth">
          {renderGrowthAnalysis()}
        </TabsContent>
        
        <TabsContent value="combined">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comprehensive Sales Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="quarter" 
                        tickFormatter={(value) => `${value} ${value.split('-')[0]}`}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="sales" 
                        name="Quarterly Sales" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                      >
                        {seasonalData.map((entry) => {
                          // Assign color based on quarter
                          const quarterIndex = parseInt(entry.quarter.split('-')[1].substring(1)) - 1;
                          return <Cell key={`cell-${entry.quarter}-${entry.year}`} fill={colors[quarterIndex]} />;
                        })}
                      </Bar>
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        name="Trend Line" 
                        stroke="#a855f7" 
                        dot={false}
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <Alert className="mt-6 bg-primary/5 border-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <AlertTitle>Combined Insight</AlertTitle>
                  <AlertDescription className="text-sm">
                    This visualization combines seasonal patterns with overall growth trends, providing a comprehensive view of sales performance over time. The bars show quarterly sales values, while the line represents the overall trend.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  // Render based on props
  if (showAllAnalysis) {
    return renderCombinedAnalysis();
  }
  
  return analysisType === 'seasonal' ? renderSeasonalAnalysis() : renderGrowthAnalysis();
};

export default TrendAnalysis;
