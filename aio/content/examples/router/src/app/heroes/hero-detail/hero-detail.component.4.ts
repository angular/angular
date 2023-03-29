// #docplaster
// #docregion
import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

import {Hero} from '../hero';
import {HeroService} from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent {
  hero$!: Observable<Hero>;

  constructor(private router: Router, private service: HeroService) {}

  // #docregion id-input
  @Input()
  set id(heroId: string) {
    this.hero$ = this.service.getHero(heroId);
  }
  // #enddocregion id-input

  gotoHeroes(hero: Hero) {
    const heroId = hero ? hero.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that hero.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/superheroes', {id: heroId, foo: 'foo'}]);
  }
}
