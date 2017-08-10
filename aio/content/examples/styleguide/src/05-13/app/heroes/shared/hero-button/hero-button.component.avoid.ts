import { Component, EventEmitter, Input, Output } from '@angular/core';
// #docregion example
/* avoid pointless aliasing */

@Component({
  selector: 'toh-hero-button',
  template: `<button>{{label}}</button>`
})
export class HeroButtonComponent {
  // Pointless aliases
  @Output('changeEvent') change = new EventEmitter<any>();
  @Input('labelAttribute') label: string;
}
// #enddocregion example
