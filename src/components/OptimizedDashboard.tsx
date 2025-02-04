'use client'

import React, { useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, Home, Euro, Calendar } from 'lucide-react';
import { PropertyData, FormattedPropertyData } from '@/utils/loadData';
import PropertyFilters, { FilterState } from './PropertyFilters';
import { preprocessData, ProcessedPropertyData, PreCalculatedStats } from '@/utils/dataProcessor';
import {
  useFilteredData,
  usePropertyMetrics,
  usePriceDistribution,
  usePropertyTypeDistribution,
  useDistrictPrices,
  useDistrictSales
} from '@/hooks/usePropertyAnalytics';

interface OptimizedDashboardProps {
  initialData: PropertyData[];
}

export default function OptimizedDashboard({ initialData }: OptimizedDashboardProps) {
  const [processedData, setProcessedData] = useState<ProcessedPropertyData[]>([]);
  const [stats, setStats] = useState<PreCalculatedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    postcode: '',
    propertyTypes: [],
    priceRange: [0, 100000000],
    roomRange: [0, 10],
    sizeRange: [0, 1000],
    yearBuiltRange: [1800, 2024],
    districts: [],
    dateRange: '12'
  });

  const pieChartColors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'];

  useEffect(() => {
    const processDataAsync = async () => {
      const { processedData, stats } = preprocessData(initialData);
      setProcessedData(processedData);
      setStats(stats);
      setIsLoading(false);
    };
    processDataAsync();
  }, [initialData]);

  const filteredData = useFilteredData(processedData, filters) as FormattedPropertyData[];
  const metrics = usePropertyMetrics(filteredData);
  const priceDistribution = usePriceDistribution(filteredData);
  const propertyTypes = usePropertyTypeDistribution(filteredData);
  const districtPrices = useDistrictPrices(filteredData);
  const districtSales = useDistrictSales(filteredData);

  const chartData = {
    priceRanges: Object.entries(priceDistribution).map(([range, count]) => ({ range, count })).sort(),
    propertyTypes: Object.entries(propertyTypes).map(([type, count]) => ({ type, count }))
  };

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  if (isLoading || !stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PropertyFilters
        data={processedData}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({
          search: '',
          postcode: '',
          propertyTypes: [],
          priceRange: [0, 100000000],
          roomRange: [0, 10],
          sizeRange: [0, 1000],
          yearBuiltRange: [1800, 2024],
          districts: [],
          dateRange: '12'
        })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <h3 className="text-2xl font-bold">{metrics.totalProperties}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Euro className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                <h3 className="text-2xl font-bold">
                  {new Intl.NumberFormat('da-DK', {
                    style: 'currency',
                    currency: 'DKK',
                    maximumFractionDigits: 0
                  }).format(metrics.avgPrice)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Home className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Size</p>
                <h3 className="text-2xl font-bold">{Math.round(metrics.avgSize)} m²</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Euro className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price/m²</p>
                <h3 className="text-2xl font-bold">
                  {new Intl.NumberFormat('da-DK', {
                    style: 'currency',
                    currency: 'DKK',
                    maximumFractionDigits: 0
                  }).format(metrics.avgPricePerM2)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Volume</p>
                <h3 className="text-2xl font-bold">{metrics.monthlyVolume}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={chartData.priceRanges}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData.propertyTypes}
                    nameKey="type"
                    dataKey="count"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="var(--chart-2)"
                    label={({ type, value }) => `${type}: ${value}`}
                  >
                    {chartData.propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieChartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Districts by Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart
                  data={districtPrices.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <XAxis type="number"
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('da-DK', {
                        style: 'currency',
                        currency: 'DKK',
                        maximumFractionDigits: 0,
                        notation: 'compact'
                      }).format(value)
                    }
                  />
                  <YAxis type="category" dataKey="district" />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('da-DK', {
                        style: 'currency',
                        currency: 'DKK',
                        maximumFractionDigits: 0
                      }).format(value)
                    }
                  />
                  <Bar dataKey="avgPrice" fill="var(--chart-3)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Popular Districts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart
                  data={districtSales.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="district" />
                  <Tooltip />
                  <Bar dataKey="sales" fill="var(--chart-4)" name="Number of Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Price Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <LineChart 
                  data={filteredData.slice(-30)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('da-DK')}
                  />
                  <YAxis
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('da-DK', {
                        style: 'currency',
                        currency: 'DKK',
                        notation: 'compact',
                        maximumFractionDigits: 0
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => 
                      new Intl.NumberFormat('da-DK', {
                        style: 'currency',
                        currency: 'DKK',
                        maximumFractionDigits: 0
                      }).format(value)
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="var(--chart-4)" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* <Card>
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={parentRef} className="h-[500px] overflow-auto border rounded-md">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const property = filteredData[virtualRow.index];
                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="border-b p-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{property.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.property_type} - {property.size_m2}m²
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{property.formattedPrice}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.formattedPricePerM2}/m²
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}