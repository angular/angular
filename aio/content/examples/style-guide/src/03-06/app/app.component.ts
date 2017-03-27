import { Component, OnInit } from '@angular/core';

import { Hero, HeroService } from './heroes';
import { ExceptionService, SpinnerService, ToastService } from './core';

@Component({
  selector: 'sg-app',
  templateUrl: './app.component.html',
  providers: [HeroService, ExceptionService, SpinnerService, ToastService]
})
export class AppComponent implements OnInit {
  favorite: Hero;
  heroes: Hero[];

  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.heroService.getHero(1).subscribe(hero => this.favorite = hero);
    this.heroService.getHeroes().subscribe(heroes => this.heroes = heroes);
  }
}
