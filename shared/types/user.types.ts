export interface User {
  id: string;
  email: string;
  favorites?: string[];
}

export interface RegisterUserDTO {
  email: string;
  password: string;
}

export interface RegisterResponseDTO {
  user: User;
  accessToken: string;
}
