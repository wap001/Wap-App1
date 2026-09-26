/**
 * Client Utility for Administrative Email Whitelisting
 * 
 * Enforces strict email whitelisting for all administrative access, replacing
 * invitation codes and access keys. Synchronizes with backend database table
 * and maintains resilient client-side verification cache.
 */

export interface AdminWhitelistEntry {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'revoked';
  addedAt: string;
  addedBy: string;
  notes: string;
  isProtected?: boolean;
}

// Built-in initial fallback seed matching backend configuration
export const DEFAULT_ADMIN_WHITELIST: AdminWhitelistEntry[] = [
  {
    id: 'whitelist-root-001',
    email: 'stangyneco@gmail.com',
    name: 'Stangy Neco',
    role: 'super_admin',
    status: 'active',
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'SYSTEM_ROOT_BOOTSTRAP',
    notes: 'Platform Founder & Master Super-Administrator. Permanent root clearance Level 4.',
    isProtected: true
  },
  {
    id: 'whitelist-ops-002',
    email: 'admin@wap-transport.ht',
    name: 'Wap Platform Supervisor',
    role: 'admin',
    status: 'active',
    addedAt: '2026-01-05T00:00:00.000Z',
    addedBy: 'stangyneco@gmail.com',
    notes: 'Regional Operations Supervisor (Port-au-Prince Hub & Caribbean Gateway).',
    isProtected: false
  },
  {
    id: 'whitelist-ops-003',
    email: 'security@wap.delivery',
    name: 'Wap Security & DevOps Lead',
    role: 'admin',
    status: 'active',
    addedAt: '2026-02-10T12:00:00.000Z',
    addedBy: 'stangyneco@gmail.com',
    notes: 'DevOps & PostGIS Infrastructure Lead for Dakar, Cayenne, and Georgetown clusters.',
    isProtected: false
  }
];

const LOCAL_STORAGE_WHITELIST_KEY = 'wap_admin_whitelist_cache';

/**
 * Loads current whitelist from local cache or fallback seed
 */
export function getLocalCachedWhitelist(): AdminWhitelistEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WHITELIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // safe fallback
  }
  return [...DEFAULT_ADMIN_WHITELIST];
}

/**
 * Saves whitelist to local cache
 */
export function saveLocalCachedWhitelist(list: AdminWhitelistEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_WHITELIST_KEY, JSON.stringify(list));
  } catch {
    // safe fallback
  }
}

/**
 * Synchronous client-side check if an email is on the administrator whitelist
 */
export function isEmailAdminWhitelistedSync(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const list = getLocalCachedWhitelist();
  return list.some((item) => item.email.trim().toLowerCase() === normalized && item.status === 'active');
}

/**
 * Real-time asynchronous check comparing verified login email against backend administrative whitelist
 */
export async function verifyEmailAgainstAdminWhitelist(
  email: string
): Promise<{ isWhitelisted: boolean; role: 'admin' | 'customer'; adminDetails?: any }> {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) {
    return { isWhitelisted: false, role: 'customer' };
  }

  try {
    const res = await fetch('/api/auth/verify-admin-whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isWhitelisted: Boolean(data.isWhitelisted),
        role: data.isWhitelisted ? 'admin' : 'customer',
        adminDetails: data.adminDetails
      };
    }
  } catch (err) {
    console.warn('[Admin Whitelist] Backend verification error, using cached whitelist', err);
  }

  // Graceful fallback to cached synchronous whitelist
  const isWhitelisted = isEmailAdminWhitelistedSync(normalized);
  return {
    isWhitelisted,
    role: isWhitelisted ? 'admin' : 'customer'
  };
}

/**
 * Fetch all administrator whitelist entries from backend API
 */
export async function fetchRemoteAdminWhitelist(actorEmail: string): Promise<AdminWhitelistEntry[]> {
  try {
    const res = await fetch('/api/admin/whitelist', {
      headers: {
        'x-user-email': actorEmail,
        'x-user-role': 'admin'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.whitelist)) {
        saveLocalCachedWhitelist(data.whitelist);
        return data.whitelist;
      }
    }
  } catch (err) {
    console.warn('[Admin Whitelist] Error fetching remote whitelist:', err);
  }
  return getLocalCachedWhitelist();
}

/**
 * Add a new approved email address to the administrator whitelist
 */
export async function addRemoteAdminWhitelistEntry(
  entry: { email: string; name: string; role?: 'super_admin' | 'admin'; notes?: string },
  actorEmail: string
): Promise<{ success: boolean; entry?: AdminWhitelistEntry; error?: string; whitelist?: AdminWhitelistEntry[] }> {
  try {
    const res = await fetch('/api/admin/whitelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': actorEmail,
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ ...entry, adminActorId: actorEmail })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.whitelist) {
        saveLocalCachedWhitelist(data.whitelist);
      }
      return data;
    }
    return { success: false, error: data.error || 'Failed to add administrator email to whitelist.' };
  } catch (err: any) {
    console.warn('[Admin Whitelist] Error adding whitelist entry:', err);
    // Fallback in-memory/cache update
    const current = getLocalCachedWhitelist();
    const normalized = entry.email.trim().toLowerCase();
    if (current.some((e) => e.email.toLowerCase() === normalized && e.status === 'active')) {
      return { success: false, error: 'Email already exists in administrator whitelist.' };
    }
    const newRecord: AdminWhitelistEntry = {
      id: `whitelist-${Date.now()}`,
      email: normalized,
      name: entry.name || normalized.split('@')[0],
      role: entry.role || 'admin',
      status: 'active',
      addedAt: new Date().toISOString(),
      addedBy: actorEmail,
      notes: entry.notes || 'Added locally via master admin panel.',
      isProtected: false
    };
    current.push(newRecord);
    saveLocalCachedWhitelist(current);
    return { success: true, entry: newRecord, whitelist: current };
  }
}

/**
 * Remove an approved email address from the administrator whitelist
 */
export async function removeRemoteAdminWhitelistEntry(
  idOrEmail: string,
  actorEmail: string
): Promise<{ success: boolean; error?: string; removedEntry?: AdminWhitelistEntry; whitelist?: AdminWhitelistEntry[] }> {
  try {
    const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(idOrEmail)}`, {
      method: 'DELETE',
      headers: {
        'x-user-email': actorEmail,
        'x-user-role': 'admin'
      }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.whitelist) {
        saveLocalCachedWhitelist(data.whitelist);
      }
      return data;
    }
    return { success: false, error: data.error || 'Failed to remove administrator email.' };
  } catch (err: any) {
    console.warn('[Admin Whitelist] Error removing whitelist entry:', err);
    const current = getLocalCachedWhitelist();
    const normalized = idOrEmail.trim().toLowerCase();
    const target = current.find((e) => e.id === idOrEmail || e.email.toLowerCase() === normalized);
    if (!target) {
      return { success: false, error: 'Administrator whitelist entry not found.' };
    }
    if (target.isProtected || target.email.toLowerCase() === 'stangyneco@gmail.com') {
      return { success: false, error: 'Root Master Super-Administrator account is protected and cannot be deleted.' };
    }
    const updated = current.filter((e) => e.id !== target.id);
    saveLocalCachedWhitelist(updated);
    return { success: true, removedEntry: target, whitelist: updated };
  }
}
