/* tslint:disable:member-ordering */
// #docplaster
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import 'rxjs/add/operator/map';

import { Hero }              from '../model';
import { HeroDetailService } from './hero-detail.service';

// #docregion prototype
@Component({
  selector:    'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls:  ['./hero-detail.component.css' ],
  providers:  [ HeroDetailService ]
})
export class HeroDetailComponent implements OnInit {
  // #docregion ctor
  constructor(
    private heroDetailService: HeroDetailService,
    private route:  ActivatedRoute,
    private router: Router) {
  }
  // #enddocregion ctor
// #enddocregion prototype

  @Input() hero: Hero;

  // #docregion ng-on-init
  ngOnInit(): void {
    // get hero when `id` param changes
    this.route.params.subscribe(p => this.getHero(p && p['id']));
  }
  // #enddocregion ng-on-init

  private getHero(id: string): void {
    // when no id or id===0, create new hero
    if (!id) {
      this.hero = new Hero();
      return;
    }

    this.heroDetailService.getHero(id).then(hero => {
      if (hero) {
        this.hero = hero;
      } else {
        this.gotoList(); // id not found; navigate to list
      }
    });
  }

  save(): void {
    this.heroDetailService.saveHero(this.hero).then(() => this.gotoList());
  }

  cancel() { this.gotoList(); }

  gotoList() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
// #docregion prototype
}
// #enddocregion prototype
