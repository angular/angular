import { Component } from '@angular/core';

@Component({
  selector: 'my-component',
  host: {'(click)': '$event.preventDefault(); $event.target'},
  template: `
    <div (click)="$event.preventDefault(); $event.target"></div>
  `
})
export class MyComponent {
}
