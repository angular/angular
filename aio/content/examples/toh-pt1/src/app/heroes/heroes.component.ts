// #docplaster
// #docregion, v1
import { Component, OnInit } from '@angular/core';
// #enddocregion v1
import { Hero } from '../hero';
// #docregion v1

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
// #docregion add-hero
export class HeroesComponent implements OnInit {
  // #enddocregion, v1
  // #enddocregion add-hero
  /*
   // #docregion add-hero
  hero = 'Windstorm';
  // ...
   // #enddocregion add-hero
  */
  // #docregion
  // #docregion hero-property-1
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  // #enddocregion hero-property-1
  // #docregion v1

  constructor() { }

  ngOnInit() {
  }
// #docregion add-hero
}
// #enddocregion add-hero
// #enddocregion, v1
