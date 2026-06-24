import { create } from 'zustand';
import { API_BASE_URL } from '@/config/api';

export interface PatientNotification {
  id: number;
  patient_id: number;
  title: string;
  message: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Unresolved' | 'Resolved' | 'Acknowledged';
  conversation_id?: string;
  created_at: string;
}

interface NotificationStore {
  notifications: PatientNotification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (patientId: number | string) => Promise<void>;
  updateNotificationStatus: (
    notificationId: number,
    status: 'Unresolved' | 'Resolved' | 'Acknowledged'
  ) => Promise<void>;
  addLiveNotification: (notification: PatientNotification) => void;
}


export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async (patientId: number | string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/mira/notifications/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patient notifications');
      }
      const data = await response.json();
      set({ notifications: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'An error occurred', isLoading: false });
    }
  },

  updateNotificationStatus: async (
    notificationId: number,
    status: 'Unresolved' | 'Resolved' | 'Acknowledged'
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mira/notifications/${notificationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification status');
      }

      const data = await response.json();
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, status: data.status } : n
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update alert status' });
      throw err;
    }
  },

  addLiveNotification: (notification: PatientNotification) => {
    set((state) => {
      // Avoid duplication
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state;
      }
      return {
        notifications: [notification, ...state.notifications],
      };
    });
  },
}));
