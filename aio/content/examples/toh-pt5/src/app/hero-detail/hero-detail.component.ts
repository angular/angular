// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';
// #docregion added-imports
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

// #enddocregion added-imports
import { Hero } from '../hero';
// #docregion added-imports
import { HeroService } from '../hero.service';
// #enddocregion added-imports

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: [ './hero-detail.component.css' ]
})
export class HeroDetailComponent implements OnInit {
  hero: Hero | undefined;

  // #docregion ctor
  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location
  ) {}
  // #enddocregion ctor

  // #docregion ngOnInit
  ngOnInit(): void {
    this.getHero();
  }

  getHero(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.heroService.getHero(id)
      .subscribe(hero => this.hero = hero);
  }
  // #enddocregion ngOnInit

  // #docregion goBack
  goBack(): void {
    this.location.back();
  }
// #enddocregion goBack
}
