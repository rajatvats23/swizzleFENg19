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
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/auth/login`, 
      credentials
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data?.token) {
          localStorage.setItem(this.AUTH_TOKEN_KEY, response.data.token);
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
  
  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}