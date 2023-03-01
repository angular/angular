import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-birthday',
  template: "<p>The hero's birthday is {{ birthday | date }}</p>"
})
export class HeroBirthdayComponent {
  birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
}
