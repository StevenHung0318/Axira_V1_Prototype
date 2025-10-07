import LineAprChart from '../LineAprChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LineAprChartExample() {
  const mockDailyApr = [8.7, 9.1, 8.9, 9.0, 8.8, 9.2, 8.9, 9.0, 8.8, 9.1, 8.9, 8.7, 8.8];
  
  return (
    <div className="p-6 bg-background">
      <Card>
        <CardHeader>
          <CardTitle>APR Chart Example</CardTitle>
        </CardHeader>
        <CardContent>
          <LineAprChart dailyApr={mockDailyApr} />
        </CardContent>
      </Card>
    </div>
  );
}