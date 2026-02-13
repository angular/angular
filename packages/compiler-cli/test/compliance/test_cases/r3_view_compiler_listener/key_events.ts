import { Component } from '@angular/core';

@Component({
  selector: 'my-comp',
  template: `
  <button 
    (keydown.enter)="handleEnter()" 
    (keydown.shift.enter)="handleShiftEnter()"
    (keydown.arrowLeft)="handleArrowLeft()"></button>
      `,
})
export class MyComponent {
  handleEnter() {}
  handleShiftEnter() {}
  handleArrowLeft() {}
}
