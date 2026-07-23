import {Directive, Input} from '@angular/core';

@Directive()
export class BaseDirective {
  @Input() value = '';
}
