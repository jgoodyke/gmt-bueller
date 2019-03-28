import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './_services/auth.service';
import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  appTitle: string = 'Bueller';
  user: User;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.user.subscribe(theUser => this.user = theUser);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
