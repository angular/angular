// #docplaster
// #docregion
import {Component, inject} from '@angular/core';
import {Hero} from './hero';
// #enddocregion
import {HeroService} from './hero.service.1';
/*
// #docregion
import { HeroService } from './hero.service';
// #enddocregion
*/
// #docregion

@Component({
  selector: 'app-hero-list',
  template: `
    @for (hero of heroes; track hero) {
      <div>{{hero.id}} - {{hero.name}}</div>
    }
  `,
})
export class HeroListComponent {
  heroes: Hero[] = inject(HeroService).getHeroes();
}
