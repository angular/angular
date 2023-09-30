import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
  <h1>Providers Example</h1>
  <nav>
    <a routerLink="">Users</a>
    <a routerLink="/admin">Admin</a>
    <a routerLink="/admin/users">Admin Users</a>
  </nav>
  <div>
    <router-outlet></router-outlet>
  </div>
  `,
  imports: [ RouterLink, RouterOutlet ],
  styles: ['nav a { padding: 1rem; }']
})
export class AppComponent{
}
