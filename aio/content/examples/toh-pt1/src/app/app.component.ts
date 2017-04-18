// #docregion
import { Component } from '@angular/core';

// #docregion hero-class-1
export class Hero {
  id: number;
  name: string;
}
// #enddocregion hero-class-1

@Component({
  selector: 'my-app',
  // #docregion editing-Hero
  template: `
    <h1>{{title}}</h1>
    <h2>{{hero.name}} details!</h2>
    <div><label>id: </label>{{hero.id}}</div>
    <div>
      <label>name: </label>
      <input [(ngModel)]="hero.name" placeholder="name">
    </div>
    `
  // #enddocregion editing-Hero
})
export class AppComponent {
  title = 'Tour of Heroes';
  // #docregion hero-property-1
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
  // #enddocregion hero-property-1
}
