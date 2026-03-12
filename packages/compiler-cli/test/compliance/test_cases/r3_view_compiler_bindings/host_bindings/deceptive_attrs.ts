import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '',
  host: {
    ['class.is-compact']: 'false',
    ['style.width']: '0',
    ['attr.tabindex']: '5',
  }
})
export class MyComponent {
}

@Component({
  selector: 'my-comp-2',
  template: '',
  host: {
    '[class.is-compact]': 'false',
    '[style.width]': '0',
    '[attr.tabindex]': '5',
  }
})
export class MyComponent2 {
}
