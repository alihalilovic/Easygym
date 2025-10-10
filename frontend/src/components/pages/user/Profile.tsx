import { useAuth } from '@/components/auth/AuthProvider';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen-content text-2xl">
      {user?.name && <p>Name: {user?.name}</p>}
      {user?.email && <p>Email: {user?.email}</p>}
      {user?.role && <p>Role: {user?.role}</p>}
    </div>
  );
};

export default Profile;
