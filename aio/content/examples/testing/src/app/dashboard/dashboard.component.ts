// #docregion
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Hero, HeroService } from '../model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {

  heroes: Hero[] = [];

  // #docregion ctor
  constructor(
    private router: Router,
    private heroService: HeroService) {
  }
  // #enddocregion ctor

  ngOnInit() {
    this.heroService.getHeroes()
      .then(heroes => this.heroes = heroes.slice(1, 5));
  }

  // #docregion goto-detail
  gotoDetail(hero: Hero) {
    let url = `/heroes/${hero.id}`;
    this.router.navigateByUrl(url);
  }
  // #enddocregion goto-detail

  get title() {
    let cnt = this.heroes.length;
    return cnt === 0 ? 'No Heroes' :
      cnt === 1 ? 'Top Hero' :  `Top ${cnt} Heroes`;
  }
}
