// #docplaster
// #docregion
import { Component, Injector, OnInit } from '@angular/core';

import { Car, Engine, Tires } from './car/car';
import { Hero } from './heroes/hero';
import { HeroService } from './heroes/hero.service';
import { heroServiceProvider } from './heroes/hero.service.provider';
import { Logger } from './logger.service';

@Component({
  selector: 'app-injectors',
  template: `
  <h2>Other Injections</h2>
  <div id="car">{{car.drive()}}</div>
  <div id="hero">{{hero.name}}</div>
  <div id="rodent">{{rodent}}</div>
  `,
  providers: [Car, Engine, Tires, heroServiceProvider, Logger]
})
export class InjectorComponent implements OnInit {
  car: Car;

  // #docregion get-hero-service
  heroService: HeroService;
  // #enddocregion get-hero-service
  hero: Hero;

  constructor(private injector: Injector) { }

  ngOnInit() {
    this.car = this.injector.get(Car);
    this.heroService = this.injector.get(HeroService);
    this.hero = this.heroService.getHeroes()[0];
  }

  get rodent() {
    const rousDontExist = `R.O.U.S.'s? I don't think they exist!`;
    return this.injector.get(ROUS, rousDontExist);
  }
}

/**
 * R.O.U.S. - Rodents Of Unusual Size
 * // https://www.youtube.com/watch?v=BOv5ZjAOpC8
 */
class ROUS { }
