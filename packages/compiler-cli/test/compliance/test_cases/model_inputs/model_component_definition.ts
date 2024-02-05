import {Component, model} from '@angular/core';

@Component({
  standalone: true,
  template: 'Works',
})
export class TestComp {
  counter = model(0);
  name = model.required<string>();
}
