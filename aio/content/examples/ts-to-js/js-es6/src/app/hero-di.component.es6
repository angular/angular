// #docregion
import { Component }   from '@angular/core';
import { DataService } from './data.service';

export class HeroComponent {
  constructor(dataService) {
    this.name = dataService.getHeroName();
  }
}

HeroComponent.annotations = [
  new Component({
    selector: 'hero-di',
    template: `<h1>Hero: {{name}}</h1>`
  })
];

HeroComponent.parameters = [
  [DataService]
];
// #enddocregion
