import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-greeting></app-greeting>
    <nav>
      <a routerLink="contact" routerLinkActive="active" ariaCurrentWhenActive="page">Contact</a>
      <a routerLink="items" routerLinkActive="active" ariaCurrentWhenActive="page">Items</a>
      <a routerLink="customers" routerLinkActive="active" ariaCurrentWhenActive="page">Customers</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
}
