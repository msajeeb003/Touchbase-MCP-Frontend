export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export interface SetCredentialsPayload {
  token: string;
  user: AuthUser;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}
