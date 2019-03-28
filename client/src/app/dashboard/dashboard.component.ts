import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // remove the login styling
    const body = document.getElementsByTagName('body')[0];
    const html = document.getElementsByTagName('html')[0];
    html.classList.remove('height-full');
    body.classList.remove('text-center', 'height-full', 'body-login');
  }

}
