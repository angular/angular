// #docplaster
// #docregion
// TODO: Feature Componetized like CrisisCenter
// #docregion rxjs-imports
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-imports
import { Component, OnInit } from '@angular/core';
// #docregion import-router
import { ActivatedRoute } from '@angular/router';
// #enddocregion import-router

import { HeroService } from '../hero.service';
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
        // (+) before `params.get()` turns the string into a number
        this.selectedId = +params.get('id');
        return this.service.getHeroes();
      })
    );
  }
  // #enddocregion ctor
// #docregion ctor
}
// #enddocregion
