import {Component, signal} from '@angular/core';

@Component({
  templateUrl: 'foo.component.html',
  standalone: false,
})
export class FooComponent {
  title = 'Foo Component';
  sig = signal(1);
  x = {
    sig: signal(1),
  };
  /** returns 1 */
  method() {
    return 1;
  }
}
