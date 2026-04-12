import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { showToast } = useToastStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');

  const initials = useMemo(() => {
    if (!user) {
      return '';
    }
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  if (!user) {
    return null;
  }

  const saveName = async () => {
    try {
      const response = await updateProfile({ name });
      updateUser({
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });
      setEditing(false);
      showToast('Profile updated');
    } catch {
      showToast('Could not update profile', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              {editing ? (
                <input value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              )}
              {editing ? (
                <button type="button" onClick={() => void saveName()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium">
                  Save
                </button>
              ) : (
                <button type="button" onClick={() => setEditing(true)} className="text-indigo-600">
                  ✏️
                </button>
              )}
            </div>
            <p className="text-gray-500 mt-2">{user.email}</p>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full mt-3">
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate('/orders')} className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium">
            My Orders
          </button>
          <button type="button" onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
