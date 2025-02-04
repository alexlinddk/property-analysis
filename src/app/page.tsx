import OptimizedDashboard from '@/components/OptimizedDashboard';
import { loadPropertyData } from '@/utils/loadData';

export default async function Home() {
  const propertyData = await loadPropertyData();
  
  return (
    <main>
      <OptimizedDashboard initialData={propertyData} />
    </main>
  );
}