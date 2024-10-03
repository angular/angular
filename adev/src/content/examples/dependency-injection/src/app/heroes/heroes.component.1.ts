import {Component} from '@angular/core';

import {HeroService} from './hero.service';
import {HeroListComponent} from './hero-list.component';

@Component({
  selector: 'app-heroes',
  providers: [HeroService],
  template: `
    <h2>Heroes</h2>
    <app-hero-list></app-hero-list>
  `,
  imports: [HeroListComponent],
})
export class HeroesComponent {}
