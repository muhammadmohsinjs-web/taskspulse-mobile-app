export interface AuthUserRaw {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface TokenPairRaw {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface AuthResponseRaw {
  user: AuthUserRaw;
  tokens: TokenPairRaw;
}

export interface TokenResponseRaw {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export function mapAuthUser(raw: AuthUserRaw): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.display_name,
    isActive: raw.is_active,
    emailVerified: raw.email_verified,
    createdAt: raw.created_at,
  };
}

export interface RegisterResponseRaw {
  message: string;
  email: string;
  verification_required: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  display_name?: string;
}
