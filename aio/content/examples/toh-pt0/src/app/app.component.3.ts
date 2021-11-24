import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// #docregion event-binding
export class AppComponent {
    title = 'Tour of Heroes';
    logo = 'https://angular.io/assets/images/logos/angular/angular.svg';
    logoWidth = '25%';

    showGreeting() {
      alert('Hello, Angular developer!');
    }
  }
// #enddocregion event-binding
