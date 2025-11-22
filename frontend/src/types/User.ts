export enum UserRole {
  Admin = 'admin',
  Trainer = 'trainer',
  Client = 'client',
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export interface TrainerConnection {
  trainer: User;
  invitationAcceptedAt: Date | null;
}

export interface ClientConnection {
  client: User;
  invitationAcceptedAt: Date | null;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthTokenResponse {
  token: string;
}
