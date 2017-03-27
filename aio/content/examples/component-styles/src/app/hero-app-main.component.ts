import { Component, Input } from '@angular/core';

import { Hero } from './hero';

@Component({
  selector: 'hero-app-main',
  template: `
    <quest-summary></quest-summary>
    <hero-details [hero]=hero [class.active]=hero.active>
      <hero-controls [hero]=hero></hero-controls>
    </hero-details>
  `
})
export class HeroAppMainComponent {
  @Input() hero: Hero;
}
