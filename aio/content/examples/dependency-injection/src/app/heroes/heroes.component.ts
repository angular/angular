// #docregion
import { Component }          from '@angular/core';

import { heroServiceProvider } from './hero.service.provider';

@Component({
  selector: 'my-heroes',
  template: `
  <h2>Heroes</h2>
  <hero-list></hero-list>
  `,
  providers: [heroServiceProvider]
})
export class HeroesComponent { }
