import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { AuthService } from '../_services/auth.service';
import { AuthUser } from '../_models/auth-user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  submitted = false;
  loading = false;
  error = false;
  errorMsg = '';
  frmLogin: FormGroup;
  
  authUser = new AuthUser;


  constructor(private router: Router, private authService: AuthService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    // setup form
    this.frmLogin = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    const user = this.authService.userValue;
    if (user) this.router.navigate(['/']);

    // apply some styling to the body
    const body = document.getElementsByTagName('body')[0];
    const html = document.getElementsByTagName('html')[0];
    html.classList.add('height-full');
    body.classList.add('text-center', 'height-full', 'body-login');

    //if (this.authService.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  // getter for easy access to form fields
  get fc() { return this.frmLogin.controls; }

  login() {
    this.submitted = true;
    this.error = false;
    this.errorMsg = '';
    
    // if form invalid, return
    if (this.frmLogin.invalid) return;
    
    this.loading = true;

    // prepare values and submit
    this.authUser.username = this.fc.username.value;
    this.authUser.password = this.fc.password.value;
    
    this.authService.login(this.authUser)
      .pipe(first())  
      .subscribe(
        res => {
          //localStorage.setItem('user', res.user);
          this.router.navigate(['/dashboard']);
        },
        err => {
          this.error = true;
          this.errorMsg = err.error.message;
          this.loading = false;
          console.log(err.error);
        }
    );
  }

}
