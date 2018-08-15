// #docregion
import { Component, EventEmitter, Output } from '@angular/core';
// #docregion example
/* avoid */

@Component({
  selector: 'toh-hero',
  template: `...`
})
export class HeroComponent {
  @Output() onSavedTheDay = new EventEmitter<boolean>();
}
// #enddocregion example
