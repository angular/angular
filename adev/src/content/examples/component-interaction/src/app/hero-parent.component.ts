// #docregion
import {Component} from '@angular/core';

import {HEROES} from './hero';

@Component({
  selector: 'app-hero-parent',
  template: `
    <h2>{{master}} controls {{heroes.length}} heroes</h2>
    
    @for (hero of heroes; track hero) {
      <app-hero-child
        [hero]="hero"
        [master]="master">
      </app-hero-child>
    }
    `,
})
export class HeroParentComponent {
  heroes = HEROES;
  master = 'Master';
}
// #enddocregion
