// #docregion
import { Component }          from '@angular/core';

import { heroServiceProvider } from './hero.service.provider';

@Component({
  selector: 'app-heroes',
  template: `
  <h2>Heroes</h2>
  <app-hero-list></app-hero-list>
  `,
  providers: [heroServiceProvider]
})
export class HeroesComponent { }
