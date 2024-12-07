import {Directive, Input, Output} from '@angular/core';
import {CustomPropDecorator} from './custom';

@Directive()
export class MyDir {
  @Input() foo!: string;

  @Input('baz') bar!: string;

  @CustomPropDecorator() custom!: string;

  @Input() @Output() @CustomPropDecorator() mixed!: string;

  none!: string;
}
