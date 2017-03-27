import { Component, OnInit } from '@angular/core';

import { Hero, HeroCollectorService } from './core';

@Component({
  selector: 'sg-app',
  template: '<div>Our hero is {{hero.name}} and {{hero.power}}</div>',
  providers: [HeroCollectorService]
})
export class AppComponent implements OnInit {
  hero: Hero;

  constructor(private heroCollectorService: HeroCollectorService) { }

  ngOnInit() {
    this.hero = this.heroCollectorService.getHero();
  }
}
