import { Component, Input } from '@angular/core';

import { Hero } from './hero';

@Component({
  selector: 'app-hero-main',
  template: `
    <app-quest-summary></app-quest-summary>
    <app-hero-details [hero]="hero" [class.active]="hero.active">
      <app-hero-controls [hero]="hero"></app-hero-controls>
    </app-hero-details>
  `
})
export class HeroAppMainComponent {
  @Input() hero: Hero;
}
