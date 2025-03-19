import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { Observable, tap } from "rxjs";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    token: string;
    requireMfa?: boolean;
    mfaSetupRequired?: boolean;
    tempToken?: string;
  };
}

export interface MfaSetupResponse {
  status: string;
  message: string;
  data: {
    qrCodeUrl: string;
    secret: string;
  };
}

export interface MfaVerifyResponse {
  status: string;
  message: string;
  data: {
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly MFA_TEMP_USER_KEY = 'mfa_temp_user';
  
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/auth/login`, 
      credentials
    ).pipe(
      tap(response => {
        if (response.status === 'success') {
          if (response.data?.requireMfa) {
            // Store user info temporarily until MFA verification is complete
            localStorage.setItem(this.MFA_TEMP_USER_KEY, JSON.stringify(response.data));
            
            // If we have a temporary token for MFA setup, store it
            if (response.data.tempToken) {
              localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.tempToken);
            }
          } else if (response.data?.token) {
            // No MFA required, set auth token directly
            localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
          }
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/auth/forgot-password`, { email });
  }
  
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/auth/reset-password/${token}`, { password });
  }

  registerAdmin(token: string, userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/auth/register/${token}`, 
      userData
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data?.token) {
          localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
        }
      })
    );
  }
  
  // New MFA methods
  getMfaSetup(): Observable<MfaSetupResponse> {
    return this.http.get<MfaSetupResponse>(`${environment.API_URL}/mfa/setup`);
  }
  
  verifyMfaSetup(code: string): Observable<MfaVerifyResponse> {
    return this.http.post<MfaVerifyResponse>(
      `${environment.API_URL}/mfa/verify-setup`,
      { code }
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data?.token) {
          // MFA setup successful, now set the auth token
          localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
          localStorage.removeItem(this.MFA_TEMP_USER_KEY);
        }
      })
    );
  }
  
  verifyMfaLogin(code: string): Observable<MfaVerifyResponse> {
    // Get the temporary user info
    const tempUser = this.getTempUserInfo();
    
    return this.http.post<MfaVerifyResponse>(
      `${environment.API_URL}/mfa/verify`,
      { userId: tempUser?._id, code }
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data?.token) {
          // MFA verification successful, now set the auth token
          localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
          localStorage.removeItem(this.MFA_TEMP_USER_KEY);
        }
      })
    );
  }
  
  getTempUserInfo(): any {
    const tempUserJson = localStorage.getItem(this.MFA_TEMP_USER_KEY);
    return tempUserJson ? JSON.parse(tempUserJson) : null;
  }
  
  isMfaRequired(): boolean {
    return !!localStorage.getItem(this.MFA_TEMP_USER_KEY);
  }
  
  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.MFA_TEMP_USER_KEY);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}