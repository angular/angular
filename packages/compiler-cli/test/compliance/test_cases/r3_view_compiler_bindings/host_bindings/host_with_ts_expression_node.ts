import {Component} from '@angular/core';

export function getBar(): string {
  console.log('This function cannot be extracted.');
  return `${Math.random()}`;
}

export const BAR_CONST = getBar();

@Component({
  selector: 'my-cmp',
  host: {
    'foo': BAR_CONST,
  },
  template: ``
})
export class MyComponent {
}
