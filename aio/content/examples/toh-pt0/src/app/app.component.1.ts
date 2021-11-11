import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    // #docregion text-interpolation
    title = 'Tour of Heroes';
    // #enddocregion text-interpolation
    // #docregion property-binding
    logo = 'https://angular.io/assets/images/logos/angular/angular.svg';
    // #enddocregion property-binding
    // #docregion attribute-binding
    logoWidth = '25%';
    // #enddocregion attribute-binding
  }
