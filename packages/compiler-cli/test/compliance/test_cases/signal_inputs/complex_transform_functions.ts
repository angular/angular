import {Directive, input} from '@angular/core';

// Note: `@Input` non-signal inputs did not support arrow functions as an example.
const toBoolean = (v: string|boolean) => v === true || v !== '';

// Note: `@Input` non-signal inputs did not support transform function "builders" and generics.
const complexTransform = <T>(defaultVal: T) => (v: string) => v || defaultVal;

@Directive({
})
export class TestDir {
  name = input.required<boolean, string|boolean>({
    transform: (v) => v === true || v !== '',
  });
  name2 = input.required<boolean, string|boolean>({transform: toBoolean});

  genericTransform = input.required({transform: complexTransform(1)});
  genericTransform2 = input.required({transform: complexTransform(null)});
}
