import {Component} from '@angular/core';

@Component({
    template: '<div class.something="{{isEnabled}}"></div>',
    standalone: false
})
export class MyComponent {
  isEnabled = true;
}
