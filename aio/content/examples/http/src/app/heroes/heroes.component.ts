import { Component, OnInit } from '@angular/core';

import { Hero } from './hero';
import { HeroesService } from './heroes.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  providers: [HeroesService],
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];
  editHero: Hero | undefined; // the hero currently being edited

  constructor(private heroesService: HeroesService) {}

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroesService.getHeroes()
      .subscribe(heroes => (this.heroes = heroes));
  }

  add(name: string): void {
    this.editHero = undefined;
    name = name.trim();
    if (!name) {
      return;
    }

    // The server will generate the id for this new hero
    const newHero: Hero = { name } as Hero;
    // #docregion add-hero-subscribe
    this.heroesService
      .addHero(newHero)
      .subscribe(hero => this.heroes.push(hero));
    // #enddocregion add-hero-subscribe
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    // #docregion delete-hero-subscribe
    this.heroesService
      .deleteHero(hero.id)
      .subscribe();
    // #enddocregion delete-hero-subscribe
    /*
    // #docregion delete-hero-no-subscribe
    // oops ... subscribe() is missing so nothing happens
    this.heroesService.deleteHero(hero.id);
    // #enddocregion delete-hero-no-subscribe
    */
  }

  edit(hero: Hero) {
    this.editHero = hero;
  }

  search(searchTerm: string) {
    this.editHero = undefined;
    if (searchTerm) {
      this.heroesService
        .searchHeroes(searchTerm)
        .subscribe(heroes => (this.heroes = heroes));
    }
  }

  update() {
    if (this.editHero) {
      this.heroesService
        .updateHero(this.editHero)
        .subscribe(hero => {
        // replace the hero in the heroes list with update from server
        const ix = hero ? this.heroes.findIndex(h => h.id === hero.id) : -1;
        if (ix > -1) {
          this.heroes[ix] = hero;
        }
      });
      this.editHero = undefined;
    }
  }
}
