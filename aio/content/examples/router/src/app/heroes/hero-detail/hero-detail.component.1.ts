// #docplaster
// #docregion
import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
// #docregion imports
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
// #enddocregion imports

import { HeroService } from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit  {
  hero$!: Observable<Hero>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HeroService
  ) {}

  ngOnInit() {
    this.hero$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getHero(params.get('id')!))
    );
  }

  // #docregion gotoHeroes
  gotoHeroes() {
    this.router.navigate(['/heroes']);
  }
  // #enddocregion gotoHeroes
}
