import { USERS_SERVICE_URL, INTERNAL_SERVICE_TOKEN } from './config.js';

interface UserInfo {
  id: string;
  email: string;
  fullname: string;
  role: string;
  documentNumber?: string;
  age?: number;
  medico?: {
    specialtyId: string;
    license_number: string;
  };
  paciente?: {
    address?: string;
  };
}

/**
 * Obtiene información de un usuario desde medcore-users
 * Usa el endpoint interno con token de servicio a servicio
 */
export async function fetchUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(`${USERS_SERVICE_URL}/internal/users/${userId}`, {
      method: 'GET',
      headers: {
        'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`[usersClient] Failed to fetch user ${userId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[usersClient] Error fetching user info:', error);
    return null;
  }
}

/**
 * Obtiene información mínima de un doctor (id, fullname, specialtyId)
 */
export async function fetchDoctorName(doctorId: string): Promise<{ id: string; fullname: string; specialtyId?: string } | null> {
  try {
    const response = await fetch(`${USERS_SERVICE_URL}/internal/doctors/${doctorId}/name`, {
      method: 'GET',
      headers: {
        'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`[usersClient] Failed to fetch doctor ${doctorId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[usersClient] Error fetching doctor name:', error);
    return null;
  }
}
