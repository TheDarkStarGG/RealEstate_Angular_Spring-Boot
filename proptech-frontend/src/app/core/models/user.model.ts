// user.model.ts - Update with the new interfaces

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  roles: string[];
}

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
