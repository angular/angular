// #docregion
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Hero }                from './hero';

@Component({
  selector: 'my-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: [ './heroes.component.css' ]
})
export class HeroesComponent implements OnInit {
  heroes: Hero[];
  selectedHero: Hero;

  constructor(
    private router: Router) { }

  getHeroes(): void {

  }

  // #docregion add
  add(name: string): void {
    name = name.trim();
    if (!name) { return; }

  }
  // #enddocregion add

  // #docregion delete
  delete(hero: Hero): void {

  }
  // #enddocregion delete

  ngOnInit(): void {
    this.getHeroes();
  }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  gotoDetail(): void {
    this.router.navigate(['/detail', this.selectedHero.id]);
  }
}
