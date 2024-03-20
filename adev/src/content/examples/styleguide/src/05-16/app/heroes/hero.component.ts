// #docregion
import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  standalone: true,
  selector: 'toh-hero',
  template: `...`,
})
// #docregion example
export class HeroComponent {
  @Output() savedTheDay = new EventEmitter<boolean>();
}
// #enddocregion example
