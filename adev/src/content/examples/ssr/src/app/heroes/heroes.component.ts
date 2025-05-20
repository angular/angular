import {Component, inject, OnInit} from '@angular/core';
import {NgFor} from '@angular/common';
import {RouterLink} from '@angular/router';

import {Hero} from '../hero';
import {HeroService} from '../hero.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  imports: [NgFor, RouterLink],
  styleUrls: ['./heroes.component.css'],
})
export class HeroesComponent {
  private heroService = inject(HeroService);
  heroes: Hero[] = [];

  constructor() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes));
  }

  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    this.heroService.addHero({name} as Hero).subscribe((hero) => {
      this.heroes.push(hero);
    });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter((h) => h !== hero);
    this.heroService.deleteHero(hero).subscribe();
  }
}
