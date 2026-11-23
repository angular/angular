# /tsconfig.json
```json
{
  "compilerOptions": {
    "strictTemplates": true
  },
  "files": ["/test.ts"]
}
```

# /test.ts
```ts
import {Directive, Component, Input, signal} from '@angular/core';

const ɵNgFieldDirective = Symbol();

export interface Item {
  id: string;
  label: string;
}

/** Stand-in for `FieldTree` from `@angular/forms/signals`. */
export interface FieldTree<T> {
  (): {value: {(): T; set: (v: T) => void}};
}

@Directive({
  selector: '[formField]',
})
export class FormField {
  @Input() formField: any;
  [ɵNgFieldDirective] = true;
}

/** Shaped like a `ControlValueAccessor`: all three methods are public instance methods. */
@Directive({
  selector: 'input[customCva]',
})
export class CustomCvaDirective {
  @Input() max: number | null = null;
  writeValue(value: Item | null): void {}
  registerOnChange(fn: (value: Item | null) => void): void {}
  registerOnTouched(fn: () => void): void {}
}

/** Only has some of the methods, so it is not a `ControlValueAccessor`. */
@Directive({
  selector: 'input[partialCva]',
})
export class PartialCvaDirective {
  writeValue(value: Item | null): void {}
}

/** The methods exist but are not public, so it is not a `ControlValueAccessor`. */
@Directive({
  selector: 'input[privateCva]',
})
export class PrivateCvaDirective {
  private writeValue(value: Item | null): void {}
  protected registerOnChange(fn: (value: Item | null) => void): void {}
  registerOnTouched(fn: () => void): void {}
}

@Component({
  selector: 'my-comp',
  template: `
    <input customCva [formField]="itemField" [max]="maxValue" />
    <input partialCva [formField]="itemField" />
    <input privateCva [formField]="itemField" />
  `,
  imports: [FormField, CustomCvaDirective, PartialCvaDirective, PrivateCvaDirective],
})
export class MyComp {
  itemField!: FieldTree<Item | null>;
  maxValue = 10;
}
```
