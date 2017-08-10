import { Component, Inject } from '@angular/core';

// #docregion
@Component({
  selector: 'hero-di-inject',
  template: `<h1>Hero: {{name}}</h1>`
})
export class HeroComponent {
  constructor(@Inject('heroName') private name: string) { }
}
// #enddocregion
