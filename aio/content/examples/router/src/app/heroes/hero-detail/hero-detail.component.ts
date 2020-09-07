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
    // HeroList 컴포넌트에 하이라이트를 표시하기 위해 히어로의 id가 존재하면 전달합니다.
    // 'foo' 프로퍼티는 사용하지 않지만 이렇게 전달할 수도 있습니다.
    this.router.navigate(['/superheroes', { id: heroId, foo: 'foo' }]);
  }
  // #enddocregion redirect
}
