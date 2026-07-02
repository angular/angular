// tslint:disable

import {Directive, Input} from '@angular/core';

// see: button-base Material.

@Directive()
class TransformIncompatibleTypes {
  // @ts-ignore Simulate `--strictPropertyInitialization=false`.
  @Input({transform: (v: unknown) => (v === null ? undefined : !!v)}) disabled: boolean;
}
