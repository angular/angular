import { Component, HostBinding } from '@angular/core';
import { Hero } from './hero';

// #docregion
@Component({
  selector: 'app-root',
  template: `
    <h1>Tour of Heroes</h1>
    <app-hero-main [hero]="hero"></app-hero-main>
  `,
  styleUrls: ['./hero-app.component.css']
})
export class HeroAppComponent {
// #enddocregion
  hero = new Hero(
    'Human Torch',
    ['Mister Fantastic', 'Invisible Woman', 'Thing']
  );

  @HostBinding('class') get themeClass() {
    return 'theme-light';
  }
// #docregion
}
// #enddocregion
