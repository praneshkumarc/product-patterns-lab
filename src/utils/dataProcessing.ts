
import { SalesRecord } from './mockData';

// Function to clean sales data by handling missing values and anomalies
export const cleanSalesData = (data: SalesRecord[]): SalesRecord[] => {
  if (!data || data.length === 0) return [];
  
  // Create a copy to avoid mutating the original
  const cleanedData = [...data];
  
  // Calculate average values for numeric fields
  const avgQuantity = calculateAverage(data, 'quantity');
  const avgUnitPrice = calculateAverage(data, 'unitPrice');
  
  // Get most common values for categorical fields
  const mostCommonProduct = getMostCommonValue(data, 'product');
  const mostCommonCategory = getMostCommonValue(data, 'category');
  const mostCommonRegion = getMostCommonValue(data, 'region');
  const mostCommonCustomerType = getMostCommonValue(data, 'customerType');
  
  // Clean each record
  return cleanedData.map(record => {
    const cleanRecord = { ...record };
    
    // Handle missing categorical values
    if (!cleanRecord.product) cleanRecord.product = mostCommonProduct;
    if (!cleanRecord.category) cleanRecord.category = mostCommonCategory;
    if (!cleanRecord.region) cleanRecord.region = mostCommonRegion;
    if (!cleanRecord.customerType) cleanRecord.customerType = mostCommonCustomerType;
    
    // Handle missing or anomalous numeric values
    // For quantity, if it's missing, zero, or unusually high (>3 std dev), replace with average
    if (!cleanRecord.quantity || cleanRecord.quantity === 0 || isOutlier(data, cleanRecord, 'quantity', 3)) {
      cleanRecord.quantity = avgQuantity;
    }
    
    // For unitPrice, if it's missing, zero, or unusually high/low, replace with average
    if (!cleanRecord.unitPrice || cleanRecord.unitPrice === 0 || isOutlier(data, cleanRecord, 'unitPrice', 3)) {
      cleanRecord.unitPrice = avgUnitPrice;
    }
    
    // Recalculate totalSales
    cleanRecord.totalSales = cleanRecord.quantity * cleanRecord.unitPrice;
    
    return cleanRecord;
  });
};

// Helper function to calculate average of a numeric field
const calculateAverage = (data: SalesRecord[], field: keyof SalesRecord): number => {
  // Filter out records with missing values for the field
  const validRecords = data.filter(record => (record[field] as any) !== undefined && (record[field] as any) !== null);
  
  if (validRecords.length === 0) return 0;
  
  // Calculate the sum
  const sum = validRecords.reduce((acc, record) => acc + (record[field] as any), 0);
  
  // Return the average
  return sum / validRecords.length;
};

// Helper function to get most common value in a categorical field
const getMostCommonValue = (data: SalesRecord[], field: keyof SalesRecord): string => {
  // Create a frequency map
  const frequencies: Record<string, number> = {};
  
  data.forEach(record => {
    const value = record[field] as string;
    if (value) {
      frequencies[value] = (frequencies[value] || 0) + 1;
    }
  });
  
  // Find the most common value
  let mostCommonValue = '';
  let highestFrequency = 0;
  
  Object.entries(frequencies).forEach(([value, frequency]) => {
    if (frequency > highestFrequency) {
      mostCommonValue = value;
      highestFrequency = frequency;
    }
  });
  
  return mostCommonValue;
};

// Helper function to check if a value is an outlier based on standard deviations
const isOutlier = (data: SalesRecord[], record: SalesRecord, field: keyof SalesRecord, stdDevThreshold: number): boolean => {
  // Calculate mean and standard deviation for the field
  const values = data.map(r => r[field] as number).filter(val => typeof val === 'number');
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Check if the value is an outlier
  const value = record[field] as number;
  return Math.abs(value - mean) > stdDevThreshold * stdDev;
};

// Function to aggregate data by a specific field
export const aggregateBy = (data: SalesRecord[], field: keyof SalesRecord): { label: string; value: number }[] => {
  if (!data || data.length === 0) return [];
  
  const aggregated: Record<string, number> = {};
  
  data.forEach(record => {
    const key = String(record[field]);
    if (key) {
      if (!aggregated[key]) {
        aggregated[key] = 0;
      }
      aggregated[key] += record.totalSales;
    }
  });
  
  return Object.entries(aggregated)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

// Function to calculate year-over-year growth
export const calculateYoYGrowth = (data: SalesRecord[]): { year: number; sales: number; growth: number }[] => {
  if (!data || data.length === 0) return [];
  
  const yearlyData: Record<number, number> = {};
  
  data.forEach(record => {
    const year = new Date(record.date).getFullYear();
    if (!yearlyData[year]) {
      yearlyData[year] = 0;
    }
    yearlyData[year] += record.totalSales;
  });
  
  const result = Object.entries(yearlyData)
    .map(([yearStr, sales]) => {
      const year = parseInt(yearStr);
      return { year, sales, growth: 0 };
    })
    .sort((a, b) => a.year - b.year);
  
  // Calculate YoY growth
  for (let i = 1; i < result.length; i++) {
    const previousYearSales = result[i - 1].sales;
    const currentYearSales = result[i].sales;
    const growth = ((currentYearSales - previousYearSales) / previousYearSales) * 100;
    result[i].growth = parseFloat(growth.toFixed(2));
  }
  
  return result;
};

// Function to detect seasonality in the data
export const detectSeasonality = (data: SalesRecord[]): { quarter: string; averageSales: number }[] => {
  if (!data || data.length === 0) return [];
  
  const quarterData: Record<string, number[]> = {
    'Q1': [],
    'Q2': [],
    'Q3': [],
    'Q4': []
  };
  
  data.forEach(record => {
    const date = new Date(record.date);
    const month = date.getMonth();
    let quarter;
    
    if (month < 3) quarter = 'Q1';
    else if (month < 6) quarter = 'Q2';
    else if (month < 9) quarter = 'Q3';
    else quarter = 'Q4';
    
    quarterData[quarter].push(record.totalSales);
  });
  
  return Object.entries(quarterData)
    .map(([quarter, sales]) => {
      const sum = sales.reduce((acc, val) => acc + val, 0);
      const averageSales = sales.length ? sum / sales.length : 0;
      return { quarter, averageSales: parseFloat(averageSales.toFixed(2)) };
    });
};
