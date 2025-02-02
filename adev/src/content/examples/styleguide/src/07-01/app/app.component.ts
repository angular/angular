import {Component, inject, OnInit} from '@angular/core';

import {Hero, HeroService} from './heroes';

@Component({
  selector: 'sg-app',
  templateUrl: './app.component.html',
  providers: [HeroService],
  standalone: false,
})
export class AppComponent implements OnInit {
  heroes: Hero[] = [];

  private heroService = inject(HeroService);

  ngOnInit() {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes));
  }
}
