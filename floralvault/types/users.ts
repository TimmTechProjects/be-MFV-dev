export interface User {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  joinedAt: string | Date;
  plan: string;
}

export interface UserCredentials extends Pick<User, "id" | "username"> {
  password: string;
  email?: string;
}

export interface RegisterUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserResult {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}
