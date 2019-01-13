// #docplaster
// #docregion
// #docregion rxjs-operator-import
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-operator-import
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

import { HeroService }  from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  hero$: Observable<Hero>;

  // #docregion ctor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HeroService
  ) {}
  // #enddocregion ctor

  // #docregion ngOnInit
  ngOnInit() {
    this.hero$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getHero(params.get('id')))
    );
  }
  // #enddocregion ngOnInit

  // #docregion gotoHeroes
  gotoHeroes(hero: Hero) {
    let heroId = hero ? hero.id : null;
    // HeroList 컴포넌트에서 히어로를 선택하기 위해 히어로의 id를 전달합니다.
    // 'foo' 프로퍼티는 사용하지 않는 프로퍼티입니다.
    this.router.navigate(['/heroes', { id: heroId, foo: 'foo' }]);
  }
  // #enddocregion gotoHeroes
}

/*
// #docregion redirect
  this.router.navigate(['/superheroes', { id: heroId, foo: 'foo' }]);
// #enddocregion redirect
*/
