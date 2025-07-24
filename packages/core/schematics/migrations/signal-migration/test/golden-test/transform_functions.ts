// tslint:disable

import {Input} from '@angular/core';
import {COMPLEX_VAR} from './required-no-explicit-type-extra';

function x(v: string | undefined): string | undefined {
  return v;
}

export class TransformFunctions {
  // We can check this, and expect `as any` due to transform incompatibility.
  @Input({required: true, transform: (v: string | undefined) => ''}) withExplicitTypeWorks: {
    ok: true;
  } = null!;

  // This will be a synthetic type because we add `undefined` to `boolean`.
  @Input({required: true, transform: x}) synthetic1?: boolean;
  // Synthetic as we infer a full type from the initial value. Cannot be checked.
  @Input({required: true, transform: (v: string | undefined) => ''}) synthetic2 = {
    infer: COMPLEX_VAR,
  };
}
