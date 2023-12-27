import { Component, OnInit } from '@angular/core';

import { Hero, HeroService } from './heroes';

@Component({
  selector: 'sg-app',
  templateUrl: './app.component.html',
  providers: [HeroService]
})
export class AppComponent implements OnInit {
  heroes: Hero[] = [];

  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.heroService.getHeroes().subscribe(heroes => this.heroes = heroes);
  }
}
