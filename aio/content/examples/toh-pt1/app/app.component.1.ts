import { Component } from '@angular/core';

let t = {
// #docregion show-hero
template: `<h1>{{title}}</h1><h2>{{hero}} details!</h2>`
// #enddocregion show-hero
};

t = {
// #docregion show-hero-2
template: `<h1>{{title}}</h1><h2>{{hero.name}} details!</h2>`
// #enddocregion show-hero-2
};

t = {
// #docregion multi-line-strings
template: `
  <h1>{{title}}</h1>
  <h2>{{hero.name}} details!</h2>
  <div><label>id: </label>{{hero.id}}</div>
  <div><label>name: </label>{{hero.name}}</div>
  `
// #enddocregion multi-line-strings
};


/*
// #docregion name-input
<div>
  <label>name: </label>
  <input [(ngModel)]="hero.name" placeholder="name">
</div>
// #enddocregion name-input
*/

/////////////////

@Component(t)
// #docregion app-component-1
export class AppComponent {
  title = 'Tour of Heroes';
  hero = 'Windstorm';
}
// #enddocregion app-component-1
