// #docregion
// Observable Version
import { Component, OnInit } from '@angular/core';
import { Hero }              from './hero';
import { HeroService }       from './hero.service';

@Component({
  selector: 'hero-list',
  templateUrl: './hero-list.component.html',
  providers: [ HeroService ],
  styles: ['.error {color:red;}']
})
// #docregion component
export class HeroListComponent implements OnInit {
  errorMessage: string;
  heroes: Hero[];
  mode = 'Observable';

  constructor (private heroService: HeroService) {}

  ngOnInit() { this.getHeroes(); }

  // #docregion methods
  // #docregion getHeroes
  getHeroes() {
    this.heroService.getHeroes()
                     .subscribe(
                       heroes => this.heroes = heroes,
                       error =>  this.errorMessage = <any>error);
  }
  // #enddocregion getHeroes

  // #docregion addHero
  addHero(name: string) {
    if (!name) { return; }
    this.heroService.create(name)
                     .subscribe(
                       hero  => this.heroes.push(hero),
                       error =>  this.errorMessage = <any>error);
  }
  // #enddocregion addHero
  // #enddocregion methods
}
// #enddocregion component
