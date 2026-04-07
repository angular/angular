import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/" id="home-link">Home</a> |
      <a routerLink="/nested" id="nested-link">Nested Animations</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
