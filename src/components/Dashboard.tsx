
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpRight, 
  LineChart, 
  PieChart, 
  BarChart3, 
  CalendarDays, 
  Users, 
  Settings
} from 'lucide-react';
import DataImporter from './DataImporter';
import SalesAnalytics from './SalesAnalytics';
import TrendAnalysis from './TrendAnalysis';
import SegmentationTool from './SegmentationTool';
import CollaborationPanel from './CollaborationPanel';
import { SalesRecord } from '@/utils/mockData';
import { cleanSalesData } from '@/utils/dataProcessing';

const Dashboard = () => {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [cleanedData, setCleanedData] = useState<SalesRecord[]>([]);
  const [activeTab, setActiveTab] = useState('import');
  const [dataImported, setDataImported] = useState(false);
  
  // Handle data import
  const handleDataImport = (newData: SalesRecord[]) => {
    setSalesData(newData);
    const cleaned = cleanSalesData(newData);
    setCleanedData(cleaned);
    setDataImported(true);
    
    // Automatically switch to overview tab when data is imported
    if (newData.length > 0) {
      setActiveTab('overview');
    }
  };

  // Stats for overview cards
  const totalSales = cleanedData.reduce((acc, record) => acc + record.totalSales, 0);
  const avgOrderValue = cleanedData.length > 0 ? totalSales / cleanedData.length : 0;
  const uniqueProducts = new Set(cleanedData.map(record => record.product)).size;
  const uniqueRegions = new Set(cleanedData.map(record => record.region)).size;
  
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-screen-2xl animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Sales Data Analysis</h1>
        <p className="text-muted-foreground">
          Analyze historical sales data patterns to inform pricing decisions
        </p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:flex lg:w-auto">
            <TabsTrigger value="overview" className="px-4 py-2" disabled={!dataImported}>Overview</TabsTrigger>
            <TabsTrigger value="import" className="px-4 py-2">Data Import</TabsTrigger>
            <TabsTrigger value="analytics" className="px-4 py-2" disabled={!dataImported}>Sales Analytics</TabsTrigger>
            <TabsTrigger value="trends" className="px-4 py-2" disabled={!dataImported}>Trend Analysis</TabsTrigger>
            <TabsTrigger value="segments" className="px-4 py-2" disabled={!dataImported}>Segmentation</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          {dataImported ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover-lift glass-card">
                  <CardHeader className="pb-2">
                    <CardDescription>Total Sales</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-semibold">${totalSales.toLocaleString()}</CardTitle>
                      <ArrowUpRight className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Based on {cleanedData.length.toLocaleString()} records
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift glass-card">
                  <CardHeader className="pb-2">
                    <CardDescription>Average Order Value</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-semibold">${avgOrderValue.toFixed(2)}</CardTitle>
                      <BarChart3 className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Per transaction average
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift glass-card">
                  <CardHeader className="pb-2">
                    <CardDescription>Unique Products</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-semibold">{uniqueProducts}</CardTitle>
                      <PieChart className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Across all categories
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift glass-card">
                  <CardHeader className="pb-2">
                    <CardDescription>Market Regions</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-semibold">{uniqueRegions}</CardTitle>
                      <Users className="text-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Global distribution
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <Card className="glass-card col-span-2">
                  <CardHeader>
                    <CardTitle>Sales Performance Overview</CardTitle>
                    <CardDescription>Monthly sales trend over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <SalesAnalytics data={cleanedData} />
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Regional Distribution</CardTitle>
                    <CardDescription>Sales by geographical region</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <SegmentationTool 
                      data={cleanedData} 
                      segmentBy="region"
                      visType="pie"
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Seasonal Patterns</CardTitle>
                    <CardDescription>Quarterly sales analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <TrendAnalysis 
                      data={cleanedData} 
                      analysisType="seasonal"
                    />
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Customer Segmentation</CardTitle>
                    <CardDescription>Sales by customer type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <SegmentationTool 
                      data={cleanedData} 
                      segmentBy="customerType"
                      visType="bar"
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="glass-card p-8 text-center">
              <CardContent className="pt-8">
                <h3 className="text-xl font-medium mb-4">No Data Available</h3>
                <p className="text-muted-foreground mb-6">
                  Please import data to view sales analytics and insights.
                </p>
                <Button onClick={() => setActiveTab('import')} className="w-full max-w-md mx-auto">
                  Go to Data Import
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="import">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Data Import & Preprocessing</CardTitle>
              <CardDescription>
                Import your sales data, clean and prepare it for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataImporter onDataImport={handleDataImport} rawData={salesData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          {dataImported ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Sales Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive analysis of sales patterns and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[600px]">
                <SalesAnalytics data={cleanedData} showDetails />
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center">
              <CardContent className="pt-8">
                <h3 className="text-xl font-medium mb-4">No Data Available</h3>
                <p className="text-muted-foreground mb-6">
                  Please import data to view sales analytics.
                </p>
                <Button onClick={() => setActiveTab('import')} className="w-full max-w-md mx-auto">
                  Go to Data Import
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="trends">
          {dataImported ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>
                  Identify sales trends and seasonal patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[600px]">
                <TrendAnalysis data={cleanedData} showAllAnalysis />
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center">
              <CardContent className="pt-8">
                <h3 className="text-xl font-medium mb-4">No Data Available</h3>
                <p className="text-muted-foreground mb-6">
                  Please import data to view trend analysis.
                </p>
                <Button onClick={() => setActiveTab('import')} className="w-full max-w-md mx-auto">
                  Go to Data Import
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="segments">
          {dataImported ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Data Segmentation</CardTitle>
                <CardDescription>
                  Segment data by key factors to uncover insights
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[600px]">
                <SegmentationTool 
                  data={cleanedData} 
                  segmentBy="all"
                  visType="all"
                  allowCustomSegments
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center">
              <CardContent className="pt-8">
                <h3 className="text-xl font-medium mb-4">No Data Available</h3>
                <p className="text-muted-foreground mb-6">
                  Please import data to view segmentation analysis.
                </p>
                <Button onClick={() => setActiveTab('import')} className="w-full max-w-md mx-auto">
                  Go to Data Import
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <CollaborationPanel className="mt-8" />
    </div>
  );
};

// Add the missing Button component import
import { Button } from '@/components/ui/button';

export default Dashboard;
