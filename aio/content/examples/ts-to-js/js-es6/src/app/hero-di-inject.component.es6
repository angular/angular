import { Component, Inject } from '@angular/core';

// #docregion
export class HeroComponent {
  constructor(name) {
    this.name = name;
  }
}

HeroComponent.annotations = [
  new Component({
    selector: 'hero-di-inject',
    template: `<h1>Hero: {{name}}</h1>`
  })
];

HeroComponent.parameters = [
  [new Inject('heroName')]
];
// #enddocregion
