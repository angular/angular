import { Component } from '@angular/core';

// #docregion child-view
@Component({
  selector: 'app-child-view',
  template: `<label for="hero-name">Hero name: </label>
  <input type="text" id="hero-name" [(ngModel)]="hero">`
})
export class ChildViewComponent {
  hero = 'Magneta';
}
// #enddocregion child-view
