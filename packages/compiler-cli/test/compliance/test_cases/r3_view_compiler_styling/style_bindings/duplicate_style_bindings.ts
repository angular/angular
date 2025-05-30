import {Component} from '@angular/core';

@Component({selector: 'foo', template: ''})
export class Foo {}

@Component({
  selector: 'my-component',
  imports: [Foo],
  template: `
    <foo style="width: 1px; width: 10px;" class="cls1 cls1"></foo>
  `,
})
export class MyComponent {
}
