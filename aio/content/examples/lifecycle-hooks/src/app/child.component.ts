import { Component } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `<label for="hero-name">Hero name: </label>
  <input type="text" id="hero-name" [(ngModel)]="hero">`
})
export class ChildComponent {
  hero = 'Magneta';
}
