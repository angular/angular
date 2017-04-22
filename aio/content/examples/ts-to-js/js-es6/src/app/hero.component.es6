// #docplaster
// #docregion
// #docregion metadata
import { Component } from '@angular/core';

// #docregion appexport, class
export class HeroComponent {
  constructor() {
    this.title = 'Hero Detail';
  }
  getName() {return 'Windstorm'; }
}
// #enddocregion appexport, class

HeroComponent.annotations = [
  new Component({
    selector: 'hero-view',
    template: '<h1>{{title}}: {{getName()}}</h1>'
  })
];
// #enddocregion metadata
