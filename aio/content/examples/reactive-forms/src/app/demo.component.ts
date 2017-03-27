/* tslint:disable:member-ordering */
import { Component }  from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Hero }        from './data-model';
import { HeroService } from './hero.service';

@Component({
  selector: 'my-app',
  templateUrl: './demo.component.html'
})
export class DemoComponent {

  demos: string[] = [
    'Just a FormControl',
    'FormControl in a FormGroup',
    'Simple FormBuilder group',
    'Group with multiple controls',
    'Nested FormBuilder group',
    'PatchValue',
    'SetValue',
    'FormArray',
    'Final'].map(n => n + ' Demo');

  final = this.demos.length;
  demo = this.final; // current demo

  heroes: Observable<Hero[]>;
  isLoading = false;
  selectedHero: Hero;

  constructor(private heroService: HeroService) { }

  getHeroes() {
    this.isLoading = true;
    this.heroes = this.heroService.getHeroes()
                      .finally(() => this.isLoading = false);
    this.selectedHero = undefined;
  }

  select(hero: Hero) { this.selectedHero = hero; }

  selectDemo(demo: number) {
    this.demo = demo + 1;
    this.getHeroes();
  }
}
