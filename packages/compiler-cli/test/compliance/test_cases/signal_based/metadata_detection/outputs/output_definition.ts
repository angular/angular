import {Component, output} from '@angular/core';

@Component({
  signals: true,
  standalone: true,
  template: '',
})
export class SensorComp {
  pressed = output<void>();
}
