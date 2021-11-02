// #docregion
// #docregion import-input
import { Component, OnInit, Input } from '@angular/core';
// #enddocregion import-input
// #docregion import-hero
import { Hero } from '../hero';
// #enddocregion import-hero

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  // #docregion input-hero
  @Input() hero?: Hero;
  // #enddocregion input-hero

  constructor() { }

  ngOnInit() {
  }

}
