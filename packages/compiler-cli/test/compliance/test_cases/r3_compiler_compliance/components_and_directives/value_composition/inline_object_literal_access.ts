import {Component, input} from '@angular/core';

@Component({
  template: `<span [title]="{one: 'Hello', two: 'Hola'}[type()]"></span>`,
})
export class Greeting {
  readonly type = input<'one' | 'two'>('one');
}

