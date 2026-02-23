import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppRole } from '../../backend';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('customer' | 'shopkeeper' | 'admin')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, userProfile, profileLoading } = useAuth();
  const navigate = useNavigate();

  if (profileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access this page
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up profile...</p>
        </div>
      </div>
    );
  }

  const userRoleKey = Object.keys(AppRole).find(
    (key) => AppRole[key as keyof typeof AppRole] === userProfile.appRole
  ) as 'customer' | 'shopkeeper' | 'admin' | undefined;

  if (!userRoleKey || !allowedRoles.includes(userRoleKey)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
