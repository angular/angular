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
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  // #docregion v1

  constructor() { }

  ngOnInit() {
  }

}
// #enddocregion, v1
