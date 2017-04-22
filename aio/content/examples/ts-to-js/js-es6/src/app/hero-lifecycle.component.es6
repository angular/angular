// #docregion
import { Component } from '@angular/core';
export class HeroComponent {
  ngOnInit() {
    // todo: fetch from server async
    setTimeout(() => this.name = 'Windstorm', 0);
  }
}

HeroComponent.annotations = [
  new Component({
    selector: 'hero-lifecycle',
    template: `<h1>Hero: {{name}}</h1>`
  })
];
