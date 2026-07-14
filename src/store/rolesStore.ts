import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Role {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  permissions: Record<string, boolean>;
}

interface RolesState {
  roles: Role[];
  addRole: (role: Omit<Role, 'id' | 'isCustom'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all modules and configurations',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "ADMISSIONS.VIEW": true,
      "ADMISSIONS.MANAGE": true,
      "ACADEMICS.SESSIONS.MANAGE": true,
      "ACADEMICS.CLASSES.MANAGE": true,
      "ACADEMICS.SUBJECTS.MANAGE": true,
      "ACADEMICS.CLASSES.VIEW": true,
      "STUDENTS.PROFILE.VIEW": true,
      "STUDENTS.PROFILE.CREATE": true,
      "STUDENTS.PROFILE.EDIT": true,
      "STUDENTS.PROFILE.DELETE": true,
      "TEACHERS.VIEW": true,
      "TEACHERS.MANAGE": true,
      "HR.VIEW": true,
      "HR.MANAGE": true,
      "FEES.VIEW": true,
      "FEES.MANAGE": true,
      "ATTENDANCE.VIEW": true,
      "ATTENDANCE.MANAGE": true,
      "EXAMS.VIEW": true,
      "EXAMS.MANAGE": true,
      "LIBRARY.VIEW": true,
      "LIBRARY.MANAGE": true,
      "TRANSPORT.VIEW": true,
      "TRANSPORT.MANAGE": true,
      "USERS.VIEW": true,
      "USERS.MANAGE": true,
      "SETTINGS.VIEW": true,
      "SETTINGS.MANAGE": true
    }
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage admissions, staff, finance, and records',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "ADMISSIONS.VIEW": true,
      "ADMISSIONS.MANAGE": true,
      "ACADEMICS.SESSIONS.MANAGE": true,
      "ACADEMICS.CLASSES.MANAGE": true,
      "ACADEMICS.SUBJECTS.MANAGE": true,
      "ACADEMICS.CLASSES.VIEW": true,
      "STUDENTS.PROFILE.VIEW": true,
      "STUDENTS.PROFILE.CREATE": true,
      "STUDENTS.PROFILE.EDIT": true,
      "STUDENTS.PROFILE.DELETE": true,
      "TEACHERS.VIEW": true,
      "TEACHERS.MANAGE": true,
      "HR.VIEW": true,
      "HR.MANAGE": true,
      "FEES.VIEW": true,
      "FEES.MANAGE": true,
      "ATTENDANCE.VIEW": true,
      "ATTENDANCE.MANAGE": true,
      "EXAMS.VIEW": true,
      "EXAMS.MANAGE": true,
      "LIBRARY.VIEW": true,
      "LIBRARY.MANAGE": true,
      "TRANSPORT.VIEW": true,
      "TRANSPORT.MANAGE": true,
      "USERS.VIEW": true,
      "USERS.MANAGE": true,
      "SETTINGS.VIEW": true,
      "SETTINGS.MANAGE": false
    }
  },
  {
    id: 'principal',
    name: 'Principal',
    description: 'Academic overview and staff management',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "ADMISSIONS.VIEW": true,
      "ADMISSIONS.MANAGE": true,
      "ACADEMICS.SESSIONS.MANAGE": true,
      "ACADEMICS.CLASSES.MANAGE": true,
      "ACADEMICS.SUBJECTS.MANAGE": true,
      "ACADEMICS.CLASSES.VIEW": true,
      "STUDENTS.PROFILE.VIEW": true,
      "STUDENTS.PROFILE.CREATE": true,
      "STUDENTS.PROFILE.EDIT": true,
      "STUDENTS.PROFILE.DELETE": true,
      "TEACHERS.VIEW": true,
      "TEACHERS.MANAGE": true,
      "HR.VIEW": true,
      "HR.MANAGE": false,
      "FEES.VIEW": true,
      "FEES.MANAGE": false,
      "ATTENDANCE.VIEW": true,
      "ATTENDANCE.MANAGE": true,
      "EXAMS.VIEW": true,
      "EXAMS.MANAGE": true,
      "LIBRARY.VIEW": true,
      "LIBRARY.MANAGE": true,
      "TRANSPORT.VIEW": true,
      "TRANSPORT.MANAGE": true,
      "USERS.VIEW": true,
      "USERS.MANAGE": false,
      "SETTINGS.VIEW": true,
      "SETTINGS.MANAGE": false
    }
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Manage classroom, attendance, and grading',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "ACADEMICS.CLASSES.VIEW": true,
      "STUDENTS.PROFILE.VIEW": true,
      "ATTENDANCE.VIEW": true,
      "ATTENDANCE.MANAGE": true,
      "EXAMS.VIEW": true,
      "EXAMS.MANAGE": true,
      "LIBRARY.VIEW": true,
      "TRANSPORT.VIEW": true
    }
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Financial management and staff payroll',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "HR.VIEW": true,
      "HR.MANAGE": true,
      "FEES.VIEW": true,
      "FEES.MANAGE": true
    }
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Enrolled student view permissions',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "ACADEMICS.CLASSES.VIEW": true,
      "STUDENTS.PROFILE.VIEW": true,
      "FEES.VIEW": true,
      "ATTENDANCE.VIEW": true,
      "EXAMS.VIEW": true,
      "LIBRARY.VIEW": true,
      "TRANSPORT.VIEW": true
    }
  },
  {
    id: 'parent',
    name: 'Parent',
    description: 'Parent view permissions for ward records',
    isCustom: false,
    permissions: {
      "DASHBOARD.VIEW": true,
      "ACADEMICS.CLASSES.VIEW": true,
      "STUDENTS.PROFILE.VIEW": true,
      "FEES.VIEW": true,
      "ATTENDANCE.VIEW": true,
      "EXAMS.VIEW": true,
      "LIBRARY.VIEW": true,
      "TRANSPORT.VIEW": true
    }
  }
];

export const useRolesStore = create<RolesState>()(
  persist(
    (set) => ({
      roles: [...DEFAULT_ROLES],
      addRole: (roleData) => set((state) => ({
        roles: [...state.roles, { 
          ...roleData, 
          id: `role_${Date.now()}`, 
          isCustom: true 
        }]
      })),
      updateRole: (id, updates) => set((state) => ({
        roles: state.roles.map(role => 
          role.id === id ? { ...role, ...updates } : role
        )
      })),
      deleteRole: (id) => set((state) => ({
        roles: state.roles.filter(role => role.id !== id || !role.isCustom)
      }))
    }),
    {
      name: 'academia-roles-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
