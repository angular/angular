import {Component, Input} from '@angular/core';

// #docregion example
@Component({
  standalone: true,
  selector: 'toh-hero',
  template: `...`,
})
export class HeroComponent {
  @Input() id?: string;

  process() {
    if (this.id) {
      // ...
    }
  }
}
// #enddocregion example
