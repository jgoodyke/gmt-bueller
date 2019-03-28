import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { GlobalService } from '../_services/global.service';
import { AuthUser } from '../_models/auth-user';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  authUrl = this.global.apiBase + '/auth';

  constructor(private httpClient: HttpClient, private global: GlobalService) { 
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  // getter for current user value (will be used by route guard to determine if user is logged in)
  public get userValue(): User {
    return this.userSubject.value;
  }

  // login user with {username, password}
  login(user: AuthUser) {
    return this.httpClient.post<any>(this.authUrl, user)
      .pipe(map(response => {
        // if token, login successful
        console.log('authService | user: =============');
        console.log(response.user);
        if (response.user && response.user.token) {
          // store user and token data
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        }

        return user;
      }));
  }

  // log out user
  public logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }
}
