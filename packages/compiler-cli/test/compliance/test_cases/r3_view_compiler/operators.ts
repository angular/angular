import {Component, Pipe} from '@angular/core';

@Pipe({name: 'identity'})
export class IdentityPipe {
  transform(value: any) {
    return value;
  }
}

@Component({
  template: `
    {{ 1 + 2 }}
    {{ (1 % 2) + 3 / 4 * 5 }}
    {{ +1 }}
    {{ typeof {} === 'object' }}
    {{ !(typeof {} === 'object') }}
    {{ typeof foo?.bar === 'string' }}
    {{ typeof foo?.bar | identity }}
  `,
  imports: [IdentityPipe],
})
export class MyApp {
  foo: {bar?: string} = {bar: 'baz'};
}
