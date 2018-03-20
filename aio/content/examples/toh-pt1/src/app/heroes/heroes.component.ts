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
export class HeroesComponent implements OnInit {
  // #enddocregion, v1
  /*
  // #docregion add-hero
  hero = 'Windstorm';
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

}
// #enddocregion, v1
