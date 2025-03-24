import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  host: {'(click)': '$event.preventDefault(); $event.target.blur()'},
  template: `
    <div (click)="$event.preventDefault(); $event.target.blur()"></div>
  `
})
export class MyComponent {
}
