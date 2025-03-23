
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Database 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SalesRecord, generateMockSalesData, addDataAnomalies } from '@/utils/mockData';
import { cleanSalesData } from '@/utils/dataProcessing';

interface DataImporterProps {
  onDataImport: (data: SalesRecord[]) => void;
  rawData: SalesRecord[];
}

const DataImporter: React.FC<DataImporterProps> = ({ onDataImport, rawData }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [dataPreview, setDataPreview] = useState<SalesRecord[]>(rawData.slice(0, 5));
  const [processedData, setProcessedData] = useState<SalesRecord[]>([]);
  const [dataStats, setDataStats] = useState({
    totalRecords: rawData.length,
    missingValues: 0,
    outliers: 0,
    dataCoverage: '3 years',
  });
  const [importError, setImportError] = useState<string | null>(null);
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate file processing with progress
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // For demo, we'll just simulate processing the file
        simulateFileProcessing();
      } catch (error) {
        setImportError('Failed to parse file. Please ensure it is valid CSV or JSON.');
        setIsProcessing(false);
        setProcessingProgress(0);
        
        toast({
          title: 'Import Error',
          description: 'Failed to process the selected file.',
          variant: 'destructive',
        });
      }
    };
    
    reader.onerror = () => {
      setImportError('Error reading file. Please try again.');
      setIsProcessing(false);
      toast({
        title: 'Import Error',
        description: 'Failed to read the selected file.',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(file);
  };
  
  // Simulate file processing
  const simulateFileProcessing = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProcessingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        
        // Generate example processed data
        const generatedData = generateMockSalesData(1000);
        setProcessedData(generatedData);
        setDataPreview(generatedData.slice(0, 5));
        
        // Calculate example data statistics
        const missingCount = generatedData.filter(record => 
          !record.product || !record.category || !record.region || !record.customerType
        ).length;
        
        setDataStats({
          totalRecords: generatedData.length,
          missingValues: missingCount,
          outliers: Math.floor(generatedData.length * 0.03),
          dataCoverage: '3 years',
        });
        
        toast({
          title: 'Import Complete',
          description: `Successfully processed ${generatedData.length} records.`,
        });
      }
    }, 100);
  };
  
  // Handle cleaning data
  const handleCleanData = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate cleaning process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProcessingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        const cleanedData = cleanSalesData(processedData.length > 0 ? processedData : rawData);
        onDataImport(cleanedData);
        
        setIsProcessing(false);
        setProcessingProgress(100);
        
        toast({
          title: 'Data Cleaned',
          description: 'Successfully cleaned and processed the data.',
        });
      }
    }, 100);
  };
  
  // Handle generate sample data
  const handleGenerateSampleData = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate data generation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProcessingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        const generatedData = generateMockSalesData(1000);
        const dataWithAnomalies = addDataAnomalies(generatedData);
        
        setProcessedData(dataWithAnomalies);
        setDataPreview(dataWithAnomalies.slice(0, 5));
        
        setDataStats({
          totalRecords: dataWithAnomalies.length,
          missingValues: Math.floor(dataWithAnomalies.length * 0.05),
          outliers: Math.floor(dataWithAnomalies.length * 0.01),
          dataCoverage: '3 years',
        });
        
        onDataImport(dataWithAnomalies);
        
        setIsProcessing(false);
        
        toast({
          title: 'Sample Data Generated',
          description: 'Generated 1,000 sample sales records for analysis.',
        });
      }
    }, 100);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <Tabs defaultValue="import">
        <TabsList className="mb-4">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="clean">Clean & Preprocess</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover-lift">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Upload size={40} className="mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Upload Your Data</h3>
                <p className="text-muted-foreground mb-4">
                  Import your sales data from CSV, Excel, or JSON files
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv,.xlsx,.json"
                  className="hidden"
                />
                <Button 
                  onClick={triggerFileInput} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover-lift">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Database size={40} className="mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Generate Sample Data</h3>
                <p className="text-muted-foreground mb-4">
                  Create sample data to test the analysis features
                </p>
                <Button 
                  onClick={handleGenerateSampleData} 
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Data
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {isProcessing && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          )}
          
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
          
          {dataStats.totalRecords > 0 && !isProcessing && (
            <Alert className="mt-4 bg-muted/50">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle>Data Imported</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Records</p>
                    <p className="font-medium">{dataStats.totalRecords.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Missing Values</p>
                    <p className="font-medium">{dataStats.missingValues.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outliers</p>
                    <p className="font-medium">{dataStats.outliers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time Period</p>
                    <p className="font-medium">{dataStats.dataCoverage}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="clean" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium flex items-center mb-3">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                  Data Issues
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Missing Values</span>
                    <span className="font-medium">{dataStats.missingValues}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Outliers</span>
                    <span className="font-medium">{dataStats.outliers}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Data Quality Score</span>
                    <span className="font-medium">
                      {Math.max(0, 100 - (dataStats.missingValues + dataStats.outliers) / dataStats.totalRecords * 100).toFixed(1)}%
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-3">Cleaning Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Missing Values</h4>
                      <p className="text-sm text-muted-foreground">Replace with mean/median or most common value</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Outlier Detection</h4>
                      <p className="text-sm text-muted-foreground">Identify and handle statistical outliers (±3σ)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Data Standardization</h4>
                      <p className="text-sm text-muted-foreground">Consistent formatting across all fields</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleCleanData} 
              disabled={isProcessing || dataStats.totalRecords === 0}
              className="w-full max-w-md"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clean & Preprocess Data
                </>
              )}
            </Button>
          </div>
          
          {isProcessing && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="border rounded-md overflow-x-auto animate-fade-in">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sales</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {dataPreview.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-background/50' : 'bg-card'}>
                    <td className="px-4 py-3 text-sm">{record.id}</td>
                    <td className="px-4 py-3 text-sm">{record.date}</td>
                    <td className="px-4 py-3 text-sm">{record.product || '—'}</td>
                    <td className="px-4 py-3 text-sm">{record.category || '—'}</td>
                    <td className="px-4 py-3 text-sm">{record.region || '—'}</td>
                    <td className="px-4 py-3 text-sm">{record.customerType || '—'}</td>
                    <td className="px-4 py-3 text-sm">{record.quantity}</td>
                    <td className="px-4 py-3 text-sm">${record.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">${record.totalSales.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Showing 5 of {dataStats.totalRecords} records
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleCleanData} 
              disabled={isProcessing || dataStats.totalRecords === 0}
              className="w-full max-w-md"
            >
              Proceed to Analysis
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataImporter;
