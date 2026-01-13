import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, User, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'trainer':
        return 'default';
      case 'client':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!user) return null;

  return (
    <div className="flex justify-center min-h-screen-content w-full">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isEditing ? (
            <>
              <div className="flex justify-center">
                <ProfilePictureUpload />
              </div>

              <div className="space-y-4">
                {user.name && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                )}

                {user.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                )}

                {user.role && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium capitalize">{user.role}</p>
                      </div>
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => setIsEditing(true)}>
                Edit profile
              </Button>
            </>
          ) : (
            <ProfileEditForm
              user={user}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
