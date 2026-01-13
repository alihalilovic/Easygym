import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import userService from '@/api/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProfileEditForm = ({ user, onCancel, onSuccess }: any) => {
  const { setMeUser } = useAuth();

  const [name, setName] = useState(user.name ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (passwordError) return;

    setLoading(true);
    try {
      await userService.updateProfile({
        name,
        ...(password
          ? {
              password,
              confirmPassword,
            }
          : {}),
      });

      await setMeUser();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <Label className="mb-2 block">New password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            const value = e.target.value;
            setPassword(value);

            if (!value) {
              setConfirmPassword('');
              setPasswordError(null);
            } else if (confirmPassword && value !== confirmPassword) {
              setPasswordError('Passwords do not match');
            } else {
              setPasswordError(null);
            }
          }}
          placeholder="Leave empty to keep current password"
        />
      </div>

      {password.length > 0 && (
        <div>
          <Label className="mb-2 block">Confirm new password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);

              if (password && value && password !== value) {
                setPasswordError('Passwords do not match');
              } else {
                setPasswordError(null);
              }
            }}
            className={passwordError ? 'border-red-500' : ''}
            placeholder="Repeat new password"
          />
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">
              {passwordError}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSave}
          disabled={loading || !!passwordError}
          className="flex-1"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
