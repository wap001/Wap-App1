/**
 * Secure Backend Configuration for Administrative Access & Email Whitelisting
 * Enforces strict email whitelisting, replacing invitation codes and access keys.
 */

export interface WhitelistAdminRecord {
  email: string;
  name: string;
  isSuperAdmin: boolean;
  addedBy: string;
  addedAt: string;
  notes?: string;
}

// Initial System Master Whitelist Configuration (Root Super-Administrators)
export const INITIAL_ADMIN_EMAIL_WHITELIST: WhitelistAdminRecord[] = [
  {
    email: 'stangyneco@gmail.com',
    name: 'Stangy Neco',
    isSuperAdmin: true,
    addedBy: 'Root Security Engine',
    addedAt: '2026-01-01T00:00:00.000Z',
    notes: 'Lead Platform Master Administrator & System Owner'
  },
  {
    email: 'admin@wap-transport.ht',
    name: 'Wap Platform Supervisor',
    isSuperAdmin: true,
    addedBy: 'System Root',
    addedAt: '2026-01-01T00:00:00.000Z',
    notes: 'Infrastructure, PostGIS Dispatch & Emergency Operations'
  }
];
