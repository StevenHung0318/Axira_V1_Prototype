import MermaidFlow from '../MermaidFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MermaidFlowExample() {
  return (
    <div className="p-6 bg-background">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Flow Example</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidFlow />
        </CardContent>
      </Card>
    </div>
  );
}