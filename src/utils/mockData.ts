
// Types for our sales data
export interface SalesRecord {
  id: string;
  date: string;
  product: string;
  category: string;
  region: string;
  customerType: string;
  quantity: number;
  unitPrice: number;
  totalSales: number;
}

// Helper function to generate dates within a range
const getRandomDate = (start: Date, end: Date): string => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

// Generate mock sales data
export const generateMockSalesData = (count: number = 1000): SalesRecord[] => {
  const products = [
    'Laptop Pro', 'Smartphone X', 'Tablet Ultra', 'Desktop Workstation', 
    'Gaming Console', 'Wireless Earbuds', 'Smart Watch', 'Camera 4K',
    'Portable Speaker', 'Monitor 27"'
  ];
  
  const categories = ['Electronics', 'Computing', 'Mobile', 'Gaming', 'Accessories'];
  
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  
  const customerTypes = ['Individual', 'Small Business', 'Corporate', 'Education', 'Government'];
  
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date(2023, 11, 31);
  
  return Array.from({ length: count }, (_, i) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    const quantity = Math.floor(Math.random() * 20) + 1;
    const unitPrice = Math.floor(Math.random() * 1000) + 100;
    const totalSales = quantity * unitPrice;
    
    return {
      id: `SALE-${(i + 1000).toString().padStart(5, '0')}`,
      date: getRandomDate(startDate, endDate),
      product,
      category,
      region,
      customerType,
      quantity,
      unitPrice,
      totalSales
    };
  });
};

// Function to add data anomalies for demonstration
export const addDataAnomalies = (data: SalesRecord[]): SalesRecord[] => {
  const modifiedData = [...data];
  
  // Add some missing values
  for (let i = 0; i < 50; i++) {
    const randomIndex = Math.floor(Math.random() * modifiedData.length);
    const record = { ...modifiedData[randomIndex] };
    
    // Randomly choose a field to make empty
    const field = ['product', 'category', 'region', 'customerType'][Math.floor(Math.random() * 4)];
    (record as any)[field] = '';
    modifiedData[randomIndex] = record;
  }
  
  // Add some outliers
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * modifiedData.length);
    const record = { ...modifiedData[randomIndex] };
    
    // Make some extremely high values
    record.quantity = Math.floor(Math.random() * 1000) + 500;
    record.totalSales = record.quantity * record.unitPrice;
    modifiedData[randomIndex] = record;
  }
  
  return modifiedData;
};

// Sample mock data
export const mockSalesData = addDataAnomalies(generateMockSalesData(1000));

// Helper function to generate time series data by month
export const getMonthlyData = (data: SalesRecord[]): { month: string; sales: number }[] => {
  const monthlyData: Record<string, number> = {};
  
  data.forEach(record => {
    const date = new Date(record.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    
    monthlyData[monthYear] += record.totalSales;
  });
  
  // Convert to array and sort by date
  return Object.entries(monthlyData)
    .map(([month, sales]) => ({ month, sales }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Helper function to get data by region
export const getRegionData = (data: SalesRecord[]): { name: string; value: number }[] => {
  const regionData: Record<string, number> = {};
  
  data.forEach(record => {
    if (!regionData[record.region]) {
      regionData[record.region] = 0;
    }
    
    regionData[record.region] += record.totalSales;
  });
  
  // Convert to array
  return Object.entries(regionData)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.name); // Filter out empty regions
};

// Helper function to get seasonal data
export const getSeasonalData = (data: SalesRecord[]): { quarter: string; year: number; sales: number }[] => {
  const quarterlyData: Record<string, number> = {};
  
  data.forEach(record => {
    const date = new Date(record.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    let quarter;
    
    if (month < 3) quarter = 'Q1';
    else if (month < 6) quarter = 'Q2';
    else if (month < 9) quarter = 'Q3';
    else quarter = 'Q4';
    
    const key = `${year}-${quarter}`;
    
    if (!quarterlyData[key]) {
      quarterlyData[key] = 0;
    }
    
    quarterlyData[key] += record.totalSales;
  });
  
  // Convert to array and sort by date
  return Object.entries(quarterlyData)
    .map(([key, sales]) => {
      const [year, quarter] = key.split('-');
      return { quarter, year: parseInt(year), sales };
    })
    .sort((a, b) => a.year - b.year || a.quarter.localeCompare(b.quarter));
};
