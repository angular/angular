// #docplaster
// #docregion
// TODO: CrisisCenter와 비슷하게 수정
// #docregion rxjs-imports
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-imports
import { Component, OnInit } from '@angular/core';
// #docregion import-router
import { ActivatedRoute } from '@angular/router';
// #enddocregion import-router

import { HeroService }  from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.css']
})
// #docregion ctor
export class HeroListComponent implements OnInit {
  heroes$: Observable<Hero[]>;
  selectedId: number;

  constructor(
    private service: HeroService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.heroes$ = this.route.paramMap.pipe(
      switchMap(params => {
        // `param.get()` 앞에 붙은 (+)는 문자열을 숫자로 변환합니다.
        this.selectedId = +params.get('id');
        return this.service.getHeroes();
      })
    );
  }
  // #enddocregion ctor
// #docregion ctor
}
// #enddocregion
