// #docregion
import { Component, EventEmitter } from '@angular/core';
// #docregion example
/* avoid */

@Component({
  selector: 'toh-hero-button',
  template: `<button></button>`,
  inputs: [
    'label'
  ],
  outputs: [
    'change'
  ]
})
export class HeroButtonComponent {
  change = new EventEmitter<any>();
  label: string;
}
// #enddocregion example
