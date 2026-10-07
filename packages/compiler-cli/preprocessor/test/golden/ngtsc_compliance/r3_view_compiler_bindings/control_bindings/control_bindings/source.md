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
    "control_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /control_bindings.ts
```ts
import { Component, Directive, input } from '@angular/core';

@Directive({selector: '[formField]'})
export class FormField {
  readonly formField = input<string>();
}

@Component({
  template: `
    <div formField="Not a form control"></div>
    <div [attr.formField]="value">Not a form control either.</div>
    <input [formField]="value">
  `,
  imports: [FormField],
})
export class MyComponent {
  value = 'Hello, world!';
}
```
