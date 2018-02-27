import { Component }  from '@angular/core';
import { Observable } from 'rxjs';

import { Hero,
         HeroService } from './hero.service';

@Component({
  template: `
    <h3 highlight>Hero List</h3>
    <div *ngFor='let hero of heroes | async'>
      <a routerLink="{{hero.id}}">{{hero.id}} - {{hero.name}}</a>
    </div>
  `
})
export class HeroListComponent {
  heroes: Observable<Hero[]>;
  constructor(private heroService: HeroService) {
    this.heroes = this.heroService.getHeroes();
  }
}
