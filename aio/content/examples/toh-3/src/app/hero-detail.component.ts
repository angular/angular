// #docregion
// #docregion import-input
import { Component, Input } from '@angular/core';
// #enddocregion import-input

import { Hero } from './hero';
// #docregion template
@Component({
  selector: 'hero-detail',
  template: `
    <div *ngIf="hero">
      <h2>{{hero.name}} details!</h2>
      <div><label>id: </label>{{hero.id}}</div>
      <div>
        <label>name: </label>
        <input [(ngModel)]="hero.name" placeholder="name"/>
      </div>
    </div>
  `
})
// #enddocregion template
// #docregion class
export class HeroDetailComponent {
// #docregion hero
  @Input() hero: Hero;
// #enddocregion hero
}
// #enddocregion class

