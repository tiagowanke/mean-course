import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private token: string | null;
  private authStatusListener = new BehaviorSubject<boolean>(false);
  private tokenTimer: NodeJS.Timeout;
  private userId: string | null;

  constructor(private httpClient: HttpClient,
              private router: Router) { }

  getToken(): string | null {
    return this.token;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable()
  }

  getIsAuth(): boolean {
    return this.authStatusListener.value;
  }

  getUserId(): string | null {
    return this.userId;
  }

  createUser(email: string, password: string): void {
    const auth: AuthData = { email: email, password: password };
    this.httpClient.post('http://localhost:3000/api/users/signup', auth)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string): void {
    const auth: AuthData = { email: email, password: password };
    this.httpClient.post<{ token: string; expiresIn: number, userId: string }>('http://localhost:3000/api/users/login', auth)
      .subscribe(respose => {
        this.token = respose.token;
        if(this.token) {
          const expiresInDuration = respose.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.authStatusListener.next(true);
          this.userId = respose.userId;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.token = null;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer)
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData();
    if(authInformation) {
      const now = new Date();
      const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
      if(expiresIn > 0) {
        this.token = authInformation.token;
        this.userId = authInformation.userId;
        this.setAuthTimer(expiresIn / 1000);
        this.authStatusListener.next(true);
      }
    }
  }

  private saveAuthData(token: string, expirtionDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expiration', expirtionDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expiration');
  }

  private getAuthData(): { token: string; expirationDate: Date, userId: string | null } | void {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if(!token || !expirationDate) {
      return;
    } else {
      return {
        token: token,
        expirationDate: new Date(expirationDate),
        userId: userId
      }
    }
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer:' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

}
