# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /names.ts
```ts
export const FIELD_INPUTS = ['value', 'size: sizeAlias'];
export const FIELD_OUTPUTS = ['changed: valueChange'];
export const LABEL_ALIAS = 'labelAlias';
export const HINT_ALIAS = 'hintAlias';
export const DONE_ALIAS = 'doneAlias';
export const EXTRA_INPUT = { name: 'extra', alias: 'extraAlias', required: true };
```

# /field.ts
```ts
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import {
  DONE_ALIAS,
  EXTRA_INPUT,
  FIELD_INPUTS,
  FIELD_OUTPUTS,
  HINT_ALIAS,
  LABEL_ALIAS,
} from './names';

const LOCAL_INPUTS = ['local: localAlias'];

@Directive({
  selector: '[field]',
  // The metadata arrays come from constants: imported, spread from this file, and an object
  // entry held in an imported constant.
  inputs: [...FIELD_INPUTS, ...LOCAL_INPUTS, EXTRA_INPUT],
  outputs: FIELD_OUTPUTS,
})
export class Field {
  value = '';
  size = 0;
  local = '';
  extra = '';
  changed = new EventEmitter<string>();

  // Decorator arguments are evaluated too: a bare alias, and an alias inside an options object.
  @Input(LABEL_ALIAS) label = '';
  @Input({ alias: HINT_ALIAS, required: true }) hint = '';
  @Output(DONE_ALIAS) done = new EventEmitter<void>();
}
```

# /app.ts
```ts
import { Component } from '@angular/core';
import { Field } from './field';

@Component({
  selector: 'app-root',
  template: `
    <div
      field
      [value]="text"
      [sizeAlias]="2"
      [localAlias]="text"
      [extraAlias]="text"
      [labelAlias]="text"
      [hintAlias]="text"
      (valueChange)="onChange($event)"
      (doneAlias)="onDone()"
    ></div>
  `,
  imports: [Field],
})
export class App {
  text = 'x';
  onChange(value: string) {}
  onDone() {}
}
```
