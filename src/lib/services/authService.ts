import {
  User,
  UserRegistrationDTO,
  LoginDto,
  LoginResponseDto,
  SignupResponseDTO,
  PasswordResetRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  ApiResponse,
} from "@/lib/types/auth";

import { API_ENDPOINTS } from "../api";

class AuthService {
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("authToken", token);
  }

  private removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("authToken");
  }

  async register(
    userData: UserRegistrationDTO
  ): Promise<ApiResponse<SignupResponseDTO>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || "Registration failed",
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message || "Registration successful",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          "Network error occurred. Please check your connection and try again.",
      };
    }
  }

  async login(credentials: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || "Login failed",
        };
      }

      if (data.data && data.data.token) {
        this.setToken(data.data.token);
      }

      return {
        success: true,
        data: data,
        message: data.message || "Login successful",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          "Network error occurred. Please check your connection and try again.",
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_ME}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
        }
        return {
          success: false,
          error: data.message || "Failed to get user data",
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async requestPasswordReset(
    request: PasswordResetRequest
  ): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_PASSWORD_RESET}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Password reset request failed",
        };
      }

      return {
        success: data.success !== false,
        message: data.message || "Password reset link has been sent to your email",
      };
    } catch (error) {
      console.error("Password reset request error:", error);
      return {
        success: false,
        error: "Network error occurred. Please check your connection and try again.",
      };
    }
  }

  async verifyResetCode(
    request: VerifyResetCodeRequest
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_VERIFY_RESET}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Code verification failed",
        };
      }

      return {
        success: true,
        data: data === "Valid code",
        message:
          data === "Valid code" ? "Code verified successfully" : "Invalid code",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_RESET_PASSWORD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Password reset failed",
        };
      }

      return {
        success: true,
        message: data || "Password reset successful",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async logout(): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH_LOGOUT}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      this.removeToken();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Logout failed",
        };
      }

      return {
        success: true,
        message: data || "Logout successful",
      };
    } catch (error) {
      this.removeToken();
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredToken(): string | null {
    return this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
