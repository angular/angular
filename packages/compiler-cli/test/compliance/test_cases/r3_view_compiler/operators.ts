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
    {{ (1 % 2) + 3 / 4 * 5 ** 6 }}
    {{ +1 }}
    {{ typeof {} === 'object' }}
    {{ !(typeof {} === 'object') }}
    {{ typeof foo?.bar === 'string' }}
    {{ typeof foo?.bar | identity }}
    {{ void 'test' }}
    {{ (-1) ** 3 }}
    {{ 'bar' in foo }}
    <button (click)="number += 1"></button>
    <button (click)="number -= 1"></button>
    <button (click)="number *= 1"></button>
    <button (click)="number /= 1"></button>
    <button (click)="number %= 1"></button>
    <button (click)="number **= 1"></button>
    <button (click)="number &&= 1"></button>
    <button (click)="number ||= 1"></button>
    <button (click)="number ??= 1"></button>
  `,
  imports: [IdentityPipe],
})
export class MyApp {
  foo: {bar?: string} = {bar: 'baz'};
  number = 1;
}
