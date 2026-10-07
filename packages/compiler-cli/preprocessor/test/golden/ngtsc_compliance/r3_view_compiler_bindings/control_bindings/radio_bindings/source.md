# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "radio_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /radio_bindings.ts
```ts
import { Component, Directive, input } from '@angular/core';

@Directive({selector: '[formField]'})
export class FormField {
  readonly formField = input<string>();
}

// Notice that we check that the binding order doesn't matter
@Component({
  template: `
    <input
        type="radio"
        [formField]="value"
        [value]="'foo'"
        id="radio"
      />

      <input
        type="radio"
        [value]="'foo'"
        [formField]="value"
        id="radio"
      />
  `,
  imports: [FormField],
})
export class MyComponent {
  value = 'foo';
  
}
```
