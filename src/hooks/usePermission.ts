import { useAuthStore } from '../store/authStore';
import { useRolesStore } from '../store/rolesStore';

export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const roles = useRolesStore((state) => state.roles);

  const hasPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    
    // Super admin or admin bypass
    if (user.role === 'super_admin' || user.role === 'admin') {
      return true;
    }

    // Find the role config in our store
    const roleConfig = roles.find((r) => r.id === user.role);
    if (!roleConfig) {
      // Return false if no role configuration is found
      return false;
    }

    return !!roleConfig.permissions[permissionKey];
  };

  return { hasPermission };
}
