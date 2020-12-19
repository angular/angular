import { Component } from '@angular/core';

@Component({
  selector: 'app-child',
  template: '<input [(ngModel)]="hero">'
})
export class ChildComponent {
  hero = 'Magneta';
}
