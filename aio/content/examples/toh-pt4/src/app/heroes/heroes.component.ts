// #docplaster
// #docregion
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Hero } from '../hero';
// #docregion hero-service-import
import { HeroService } from '../hero.service';
// #enddocregion hero-service-import

// #docregion subscription
import { Subscription } from 'rxjs';
// #enddocregion subscription


@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit, OnDestroy {

  selectedHero: Hero;

  // #docregion heroes
  heroes: Hero[];
  // #enddocregion heroes

  // #docregion subscriptionInstance
  heroSubscription: Subscription;
  // #enddocregion subscriptionInstance

  // #docregion ctor
  constructor(private heroService: HeroService) { }
  // #enddocregion ctor

  // #docregion ng-on-init
  ngOnInit() {
    this.getHeroes();
  }
  // #enddocregion ng-on-init

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  // #docregion getHeroes
  getHeroes(): void {
    this.heroSubscription = this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes);
  }
  // #enddocregion getHeroes

  // #docregion unsubscribe
  ngOnDestroy() {
    this.heroSubscription.unsubscribe();
  }
  // #enddocregion unsubscribe
}
