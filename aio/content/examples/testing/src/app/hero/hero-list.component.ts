import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Hero } from '../model/hero';
import { HeroService } from '../model/hero.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './hero-list.component.html',
  styleUrls: [ './hero-list.component.css' ]
})
export class HeroListComponent implements OnInit {
  heroes: Promise<Hero[]>;
  selectedHero: Hero;

  constructor(
    private router: Router,
    private heroService: HeroService) { }

  ngOnInit() {
    this.heroes = this.heroService.getHeroes();
  }

  onSelect(hero: Hero) {
    this.selectedHero = hero;
    this.router.navigate(['../heroes', this.selectedHero.id ]);
  }
}
