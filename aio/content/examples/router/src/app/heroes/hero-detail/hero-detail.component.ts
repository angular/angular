// #docplaster
// #docregion
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
// #docregion imports-route-info
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
// #enddocregion imports-route-info
import { Observable } from 'rxjs';

import { HeroService } from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  hero$: Observable<Hero>;

  // #docregion activated-route
  constructor(
    private route: ActivatedRoute,
  // #enddocregion activated-route
    private router: Router,
    private service: HeroService
  // #docregion activated-route
  ) {}
  // #enddocregion activated-route


  ngOnInit() {
    this.hero$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getHero(params.get('id')))
    );
  }

  // #docregion redirect
  gotoHeroes(hero: Hero) {
    const heroId = hero ? hero.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that hero.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/superheroes', { id: heroId, foo: 'foo' }]);
  }
  // #enddocregion redirect
}
