'use client'

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PropertyData } from '@/utils/loadData';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-muted">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  )
});

interface HeatmapLayerProps {
  data: PropertyData[];
}

const getLocationFromPostcode = (postcode: string): [number, number] => {
  const postalCoordinates: Record<string, [number, number]> = {
    '1000': [55.6761, 12.5683], // Copenhagen K
    '2000': [55.6772, 12.5149], // Frederiksberg
    '2100': [55.7061, 12.5683], // Copenhagen Ø
    '2200': [55.6961, 12.5383], // Copenhagen N
    '2300': [55.6611, 12.5983], // Copenhagen S
    '2400': [55.7001, 12.5392], // Copenhagen NV
    '2450': [55.6501, 12.5432], // Copenhagen SV
    '2500': [55.6761, 12.5083], // Valby
  };

  const baseCode = postcode.slice(0, 4) + '0';
  return postalCoordinates[baseCode] || [55.6761, 12.5683];
};

const HeatmapLayer = ({ data }: HeatmapLayerProps) => {
  const processedData = useMemo(() => {
    return data.map(property => {
      const [lat, lng] = getLocationFromPostcode(property.postcode);
      return {
        lat,
        lng,
        weight: property.price_per_m2 / 50000,
        info: {
          price: property.price,
          address: property.address,
          propertyType: property.property_type,
          size: property.size_m2
        }
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Price Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <DynamicMap data={processedData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapLayer;