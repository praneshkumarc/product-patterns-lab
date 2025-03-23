
import React, { useState } from 'react';
import { 
  PieChart as PieChartComponent, 
  Pie, 
  BarChart, 
  Bar,
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SalesRecord } from '@/utils/mockData';
import { aggregateBy } from '@/utils/dataProcessing';

interface SegmentationToolProps {
  data: SalesRecord[];
  segmentBy?: 'region' | 'customerType' | 'category' | 'product' | 'all';
  visType?: 'pie' | 'bar' | 'all';
  allowCustomSegments?: boolean;
}

const SegmentationTool: React.FC<SegmentationToolProps> = ({ 
  data, 
  segmentBy = 'region', 
  visType = 'pie',
  allowCustomSegments = false
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string>(segmentBy !== 'all' ? segmentBy : 'region');
  const [selectedVisType, setSelectedVisType] = useState<string>(visType !== 'all' ? visType : 'pie');
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Get segmented data
  const getSegmentData = (segment: string) => {
    return aggregateBy(data, segment as keyof SalesRecord);
  };
  
  const segmentData = getSegmentData(selectedSegment);
  
  // Calculate percentages for each segment
  const totalValue = segmentData.reduce((acc, item) => acc + item.value, 0);
  const segmentDataWithPercentage = segmentData.map(item => ({
    ...item,
    percentage: parseFloat(((item.value / totalValue) * 100).toFixed(1))
  }));
  
  // Colors for the chart
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#a855f7', '#10b981', '#f97316', '#f59e0b', '#8b5cf6'];
  
  // Render pie chart
  const renderPieChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChartComponent>
          <Pie
            data={segmentDataWithPercentage}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={1}
            dataKey="value"
            nameKey="label"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            animationDuration={1500}
          >
            {segmentDataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
        </PieChartComponent>
      </ResponsiveContainer>
    );
  };
  
  // Render bar chart
  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={segmentDataWithPercentage} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
          <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
          <YAxis 
            type="category" 
            dataKey="label" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar 
            dataKey="value" 
            name={selectedSegment === 'region' ? 'Regional Sales' : 
                 selectedSegment === 'customerType' ? 'Customer Type Sales' :
                 selectedSegment === 'category' ? 'Category Sales' : 'Product Sales'} 
            radius={[0, 4, 4, 0]}
            animationDuration={1500}
          >
            {segmentDataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Simple version (for dashboard)
  if (!allowCustomSegments) {
    return (
      <div className="w-full h-full">
        {visType === 'pie' ? renderPieChart() : renderBarChart()}
      </div>
    );
  }
  
  // Full segmentation tool
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Segment By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="customerType">Customer Type</SelectItem>
              <SelectItem value="category">Product Category</SelectItem>
              <SelectItem value="product">Product</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedVisType} onValueChange={setSelectedVisType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="space-y-6">
          <div className="h-[400px] w-full">
            {selectedVisType === 'pie' ? renderPieChart() : renderBarChart()}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {segmentDataWithPercentage.slice(0, 5).map((segment, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm truncate" title={segment.label}>
                  {segment.label}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <div className="border rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {selectedSegment === 'region' ? 'Region' : 
                     selectedSegment === 'customerType' ? 'Customer Type' :
                     selectedSegment === 'category' ? 'Category' : 'Product'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {segmentDataWithPercentage.map((segment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-background/50' : 'bg-card'}>
                    <td className="px-4 py-3 text-sm">{segment.label}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(segment.value)}</td>
                    <td className="px-4 py-3 text-sm">{segment.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Distribution Analysis</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedSegment === 'region' ? 
                    'Sales are geographically distributed with significant concentration in key markets.' :
                   selectedSegment === 'customerType' ? 
                    'Different customer segments show varying purchasing patterns and value contribution.' :
                   selectedSegment === 'category' ? 
                    'Product categories have distinct market performance and contribution to overall sales.' :
                    'Individual products show varying market acceptance and sales performance.'
                  }
                </p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {segmentDataWithPercentage.slice(0, 3).map((segment, index) => (
                    <Badge key={index} variant="outline" className="bg-primary/5">
                      {segment.label}: {segment.percentage}%
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Concentration Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Top 3 {selectedSegment === 'region' ? 'regions' : 
                        selectedSegment === 'customerType' ? 'customer types' :
                        selectedSegment === 'category' ? 'categories' : 'products'} account for{' '}
                  {segmentDataWithPercentage.slice(0, 3).reduce((acc, item) => acc + item.percentage, 0).toFixed(1)}% of total sales.
                </p>
                
                <p className="text-sm text-muted-foreground mt-2">
                  {segmentDataWithPercentage[0].percentage > 50 ? 
                    `Heavy concentration in ${segmentDataWithPercentage[0].label} suggests potential market dependency risks.` :
                    `Sales distribution is relatively balanced, reducing dependency on any single ${selectedSegment}.`
                  }
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Pricing Strategy Implications</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSegment === 'region' ? 
                    `Consider region-specific pricing strategies for ${segmentDataWithPercentage[0].label} and ${segmentDataWithPercentage[1].label} to maximize revenue.` :
                   selectedSegment === 'customerType' ? 
                    `${segmentDataWithPercentage[0].label} customers represent your highest value segment, suggesting potential for premium pricing strategies.` :
                   selectedSegment === 'category' ? 
                    `The ${segmentDataWithPercentage[0].label} category may benefit from tiered pricing strategies based on its strong market position.` :
                    `High-performing products like ${segmentDataWithPercentage[0].label} may support premium pricing, while others may benefit from promotional pricing.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SegmentationTool;
