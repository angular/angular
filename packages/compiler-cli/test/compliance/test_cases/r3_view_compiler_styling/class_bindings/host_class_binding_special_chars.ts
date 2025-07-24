import {Component} from '@angular/core';

@Component({
  template: ``,
  host: {
    '[class.text-primary/80]': 'expr',
    '[class.data-active:text-green-300/80]': 'expr',
    "[class.data-[size='large']:p-8]": 'expr',
  },
})
export class MyComponent {
  expr = true;
}
