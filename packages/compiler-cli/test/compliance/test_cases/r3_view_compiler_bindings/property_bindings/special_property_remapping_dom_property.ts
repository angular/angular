import {Component} from '@angular/core';

@Component({
  template: `<label [for]="forValue"></label>`,
})
export class MyComponent {
  forValue = 'some-input';
}
