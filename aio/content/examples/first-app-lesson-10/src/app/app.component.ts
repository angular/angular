import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
// #docregion import-router-module
import { RouterModule } from '@angular/router';
// #enddocregion
@Component({
  selector: 'app-root',
  standalone: true,
  // #docregion import-router-module-deco
  imports: [
    HomeComponent,
    RouterModule,
  ],
  // #enddocregion
  // #docregion add-router-outlet
  template: `
    <main>
      <a [routerLink]="['/']">
        <header class="brand-name">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true">
        </header>
      </a>
      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  // #enddocregion
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'homes';
}
