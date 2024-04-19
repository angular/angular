import {Component} from '@angular/core';

@Component({template: '<div class.something="{{isEnabled}}"></div>'})
export class MyComponent {
  isEnabled = true;
}
