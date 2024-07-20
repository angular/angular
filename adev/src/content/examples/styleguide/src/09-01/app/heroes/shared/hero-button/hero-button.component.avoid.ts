// #docregion
import {Component} from '@angular/core';
// #docregion example
/* avoid */

@Component({
  standalone: true,
  selector: 'toh-hero-button',
  template: `<button type="button">OK</button>`,
})
export class HeroButtonComponent {
  onInit() {
    // misspelled
    console.log('The component is initialized');
  }
}
// #enddocregion example
