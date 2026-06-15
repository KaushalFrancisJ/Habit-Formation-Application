import { useAuth } from '../context/AuthContext.tsx';

export const ProfilePage = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="border-t pt-4 text-sm text-gray-600 space-y-2">
          <p><span className="font-medium">Timezone:</span> {user.timezone}</p>
        </div>
      </div>
    </div>
  );
};
