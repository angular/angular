import {Directive} from '@angular/core';

@Directive({
  selector: 'my-dir',
  host: {
    '[style.--camelCase]': 'value',
    '[style.--kebab-case]': 'value',
    'style': '--camelCase: foo; --kebab-case: foo',
  }
})
export class MyDirective {
  value: any;
}
