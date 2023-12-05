import {Component, input} from '@angular/core';

@Component({
  standalone: true,
  template: 'Works',
})
export class TestComp {
  counter = input(0);
  name = input.required<string>();
}
