import { Component } from '@angular/core';

// #docregion child-view
@Component({
  selector: 'app-child-view',
  template: '<input [(ngModel)]="hero">'
})
export class ChildViewComponent {
  hero = 'Magneta';
}
// #enddocregion child-view
