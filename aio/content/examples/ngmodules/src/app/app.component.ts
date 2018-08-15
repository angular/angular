import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-greeting></app-greeting>
    <nav>
      <a routerLink="contact" routerLinkActive="active">Contact</a>
      <a routerLink="items" routerLinkActive="active">Items</a>
      <a routerLink="customers" routerLinkActive="active">Customers</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
}
