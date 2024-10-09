// tslint:disable

import {Component, Input} from '@angular/core';

function CustomDecorator() {
  return (a: any, b: any) => {};
}

@Component({template: ''})
class ModifierScenarios {
  @Input() readonly alreadyReadonly = true;
  @Input() protected ImProtected = true;
  @Input() protected readonly ImProtectedAndReadonly = true;
  @Input() @CustomDecorator() protected readonly usingCustomDecorator = true;
}
