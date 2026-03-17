import {Directive, signal} from '@angular/core';

@Directive({
  host: {
    '(click)': 'someSignal.update(prev => prev + 1)',
    '(mousedown)': 'someSignal.update(() => componentProp + 1)',
  }
})
export class TestDir {
  someSignal = signal(0);
  componentProp = 1;
}
