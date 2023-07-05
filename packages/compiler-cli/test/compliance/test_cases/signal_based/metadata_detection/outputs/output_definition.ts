import {Component, output} from '@angular/core';

@Component({
  signals: true,
  standalone: true,
  template: '',
})
export class SensorComp {
  pressed = output<void>();
  _internalName = output<void>({alias: 'touched'});
}
