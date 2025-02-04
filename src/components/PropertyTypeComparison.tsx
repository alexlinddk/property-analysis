'use client'

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PropertyData } from '@/utils/loadData';

interface PropertyComparisonProps {
  data: PropertyData[];
}

const PropertyTypeComparison = ({ data }: PropertyComparisonProps) => {
  const comparisonData = useMemo(() => {
    const metrics = data.reduce((acc, property) => {
      if (!acc[property.property_type]) {
        acc[property.property_type] = {
          totalPrice: 0,
          totalSize: 0,
          count: 0,
          prices: []
        };
      }
      
      acc[property.property_type].totalPrice += property.price;
      acc[property.property_type].totalSize += property.size_m2;
      acc[property.property_type].count += 1;
      acc[property.property_type].prices.push(property.price);
      
      return acc;
    }, {} as Record<string, { 
      totalPrice: number; 
      totalSize: number; 
      count: number; 
      prices: number[];
    }>);

    return Object.entries(metrics).map(([type, data]) => ({
      type,
      avgPrice: data.totalPrice / data.count,
      avgSize: data.totalSize / data.count,
      pricePerM2: data.totalPrice / data.totalSize,
      count: data.count,
      medianPrice: data.prices.sort((a, b) => a - b)[Math.floor(data.prices.length / 2)]
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Type Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="type" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('da-DK', {
                      notation: 'compact',
                      maximumFractionDigits: 1
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
                <Bar dataKey="avgPrice" fill="var(--chart-1)" name="Average Price" />
                <Bar dataKey="medianPrice" fill="var(--chart-2)" name="Median Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="type" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('da-DK', {
                      notation: 'compact',
                      maximumFractionDigits: 1
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
                <Bar dataKey="pricePerM2" fill="var(--chart-3)" name="Price per m²" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyTypeComparison;