import { Component } from '@angular/core';
// #docregion import-home
import { HomeComponent } from './home/home.component';
// #enddocregion

@Component({
  selector: 'app-root',
  standalone: true,
  // #docregion app-metadata-imports
  imports: [
    HomeComponent,
  ],
  // #enddocregion
  // #docregion app-metadata-template
  template: `
    <main>
      <header class="brand-name">
        <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true">
      </header>
      <section class="content">
        <app-home></app-home>
      </section>
    </main>
  `,
  // #enddocregion
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'homes';
}
