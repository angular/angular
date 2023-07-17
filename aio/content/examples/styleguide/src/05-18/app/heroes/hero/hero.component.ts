import { Component, Input } from '@angular/core';

// #docregion example
@Component({
  selector: 'toh-hero',
  template: `...`
})
export class HeroComponent {
  @Input() id = 'default_id';
}
// #enddocregion example
