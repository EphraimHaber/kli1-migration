export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  registerEmail: string;
  registerPassword: string;
  confirmPassword: string;
  role: "customer" | "freelancer" | "none";
}
