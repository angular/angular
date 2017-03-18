// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'hero-birthday',
  // #docregion hero-birthday-template
  template: `<p>The hero's birthday is {{ birthday | date }}</p>`
  // #enddocregion hero-birthday-template
})
export class HeroBirthdayComponent {
  birthday = new Date(1988, 3, 15); // April 15, 1988
}
