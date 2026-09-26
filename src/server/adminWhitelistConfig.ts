/**
 * Secure Backend Configuration File: Administrator Email Whitelist
 * 
 * Enforces strict email whitelisting for all administrative access, replacing
 * legacy invitation codes and access keys. Only email addresses present in this
 * whitelist with an 'active' status are granted administrative privileges
 * (RBAC Level 4 Clearance) across frontend routes and backend APIs.
 */

export interface AdminWhitelistRecord {
  id: string;
  email: string; // Lowercase normalized email address
  name: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'revoked';
  addedAt: string;
  addedBy: string;
  notes: string;
  isProtected?: boolean; // Root administrator protection prevents accidental lockout
}

/**
 * Initial Administrator Whitelist Seed Configuration
 */
export const INITIAL_ADMIN_WHITELIST_CONFIG: AdminWhitelistRecord[] = [
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

/**
 * Helper to normalize email addresses for secure comparison
 */
export function normalizeAdminEmail(email?: string | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}
