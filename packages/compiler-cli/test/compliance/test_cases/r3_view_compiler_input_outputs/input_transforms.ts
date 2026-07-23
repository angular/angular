import {booleanAttribute, Directive, Input, numberAttribute} from '@angular/core';

function toUpper(value: string): string {
  return value.toUpperCase();
}

@Directive({
  selector: '[withTransforms]',
})
export class WithTransformsDirective {
  @Input({transform: booleanAttribute}) disabled = false;
  @Input({transform: numberAttribute}) size = 0;
  @Input({alias: 'labelText', transform: toUpper}) label = '';
}
