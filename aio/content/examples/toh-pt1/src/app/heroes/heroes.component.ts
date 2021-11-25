// #docplaster
// #docregion, v1
import { Component, OnInit } from '@angular/core';
// #enddocregion v1
// #docregion import-interface
import { Hero } from '../hero';
// #enddocregion import-interface
// #docregion v1

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  // #enddocregion, v1
  /*
  // #docregion add-hero
  hero = 'Windstorm';
  // #enddocregion add-hero
  */
  // #docregion, hero-interface
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  // #enddocregion hero-interface
  // #docregion v1

  constructor() { }

  ngOnInit(): void {
  }

}
// #enddocregion, v1
