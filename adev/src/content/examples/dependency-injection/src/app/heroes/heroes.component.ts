// #docregion
import {Component} from '@angular/core';
import {heroServiceProvider} from './hero.service.provider';
import {HeroListComponent} from './hero-list.component';

@Component({
  selector: 'app-heroes',
  providers: [heroServiceProvider],
  template: `
    <h2>Heroes</h2>
    <app-hero-list></app-hero-list>
  `,
  imports: [HeroListComponent],
})
export class HeroesComponent {}
