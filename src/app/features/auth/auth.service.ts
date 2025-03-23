import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { Observable, tap } from "rxjs";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  countryCode: string;
  phoneNumber: string;
  restaurantId?: string;
  token?: string;
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
    token?: string;
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
  private readonly USER_INFO_KEY = 'user_info';
  private readonly MFA_TEMP_USER_KEY = 'mfa_temp_user'
  
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
            // No MFA required, store auth token and user info
            localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
            
            // Store user info (without token)
            const userInfo = { ...response.data };
            delete userInfo.token;
            localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
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
        if (response.status === 'success') {
          if (response.data?.token) {
            // Store the auth token
            localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
            
            // Store user info (without token)
            const userInfo = { ...response.data };
            delete userInfo.token;
            localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
          }
        }
      })
    );
  }

  isManager(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'manager';
  }
  
  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'staff';
  }
  
  isAdminOrSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'superadmin';
  }
  
  // New MFA methods
  getMfaSetup(): Observable<MfaSetupResponse> {
    return this.http.get<MfaSetupResponse>(`${environment.API_URL}/mfa/setup`);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_INFO_KEY);
    return userJson ? JSON.parse(userJson) : null;
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
          
          // Get the temp user info and store as permanent user info
          const tempUser = this.getTempUserInfo();
          if (tempUser) {
            delete tempUser.tempToken;
            delete tempUser.requireMfa;
            delete tempUser.mfaSetupRequired;
            localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(tempUser));
          }
          
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
          
          // Store user info from temp storage
          if (tempUser) {
            delete tempUser.tempToken;
            delete tempUser.requireMfa;
            delete tempUser.mfaSetupRequired;
            localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(tempUser));
          }
          
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
    localStorage.removeItem(this.USER_INFO_KEY);
    localStorage.removeItem(this.MFA_TEMP_USER_KEY);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}