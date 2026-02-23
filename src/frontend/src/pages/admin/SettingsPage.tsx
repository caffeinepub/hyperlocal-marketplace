import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure platform-wide settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Global Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Platform settings configuration coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
