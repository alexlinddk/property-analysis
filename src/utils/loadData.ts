import Papa from 'papaparse';
import path from 'path';

// Conditionally require fs only on the server-side
let fs: typeof import('fs') | undefined;

if (typeof window === 'undefined') {
  fs = require('fs');
}

export interface PropertyData {
  property_type: string;
  address: string;
  postcode: string;
  district: string;
  price: number;
  date: string;
  sale_type: string;
  size_m2: number;
  price_per_m2: number;
  rooms: number;
  year_built: number;
}

export interface FormattedPropertyData extends PropertyData {
  formattedPrice: string;
  formattedPricePerM2: string;
}

interface ParseError {
  type: string;
  code: string;
  message: string;
  row?: number;
}

export async function loadPropertyData(): Promise<PropertyData[]> {
  if (!fs) {
    console.error('File system (fs) is not available');
    return [];
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'boliga_sales.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');

    const results = Papa.parse<Omit<PropertyData, 'postcode' | 'district'>>(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      console.error('CSV parsing errors:', results.errors);
    }

    return results.data.splice(0, 1000).map(property => {
      let street = property.address || '';
      let postcode = '';
      let district = '';

      if (property.address) {
        if (property.address.includes(',')) {
          // Split by comma
          const [rawStreet, rawRest] = property.address.split(',').map(part => part.trim());
          const postalAndDistrict = rawRest.match(/(\d{4})\s+(.+)/);

          if (postalAndDistrict) {
            street = `${rawStreet}, ${rawRest.split(postalAndDistrict[0])[0].trim()}`.trim();
            postcode = postalAndDistrict[1];
            district = postalAndDistrict[2];
          } else {
            // Fallback: If no valid postcode found, treat the whole part after the comma as street continuation
            street = `${rawStreet}, ${rawRest}`.trim();
          }
        } else {
          // No comma: split by regex
          const addressParts = property.address.match(/(.+)\s(\d{4})\s(.+)/);
          if (addressParts) {
            street = addressParts[1];
            postcode = addressParts[2];
            district = addressParts[3];
          }
        }
      }

      return {
        property_type: property.property_type || '',
        address: street,
        postcode: postcode,
        district: district,
        price: Number(property.price) || 0,
        date: property.date || '',
        sale_type: property.sale_type || '',
        size_m2: Number(property.size_m2) || 0,
        price_per_m2: Number(property.price_per_m2) || 0,
        rooms: Number(property.rooms) || 0,
        year_built: Number(property.year_built) || 0,
      };
    });
  } catch (error) {
    console.error('Error loading property data:', error);
    return [];
  }
}
