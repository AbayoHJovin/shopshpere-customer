import {
  User,
  UserRegistrationDTO,
  LoginDto,
  LoginResponseDto,
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
    return localStorage.getItem("auth_token");
  }

  private setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  }

  private removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  }

  async register(
    userData: UserRegistrationDTO
  ): Promise<ApiResponse<LoginResponseDto>> {
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
          error: data.message || "Registration failed",
        };
      }

      if (data.token) {
        this.setToken(data.token);
      }

      return {
        success: true,
        data: data,
        message: data.message || "Registration successful",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
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
          error: data.message || "Login failed",
        };
      }

      if (data.token) {
        this.setToken(data.token);
      }

      return {
        success: true,
        data: data,
        message: data.message || "Login successful",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
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
        data: data,
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
        success: true,
        message: data || "Password reset request sent",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
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
