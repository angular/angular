import {Component} from '@angular/core';
import {HeroListComponent} from './hero-list.component';

/**
 * A version of `HeroesComponent` that does not provide the `HeroService` (and thus relies on its
 * `Injectable`-declared provider) in order to function.
 *
 * TSP stands for Tree-Shakeable Provider.
 */
@Component({
  selector: 'app-heroes-tsp',
  template: `
    <h2>Heroes</h2>
    <app-hero-list></app-hero-list>
  `,
  imports: [HeroListComponent],
})
export class HeroesTspComponent {}
