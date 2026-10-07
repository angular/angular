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
    "aria_dom_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /aria_dom_properties.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <input [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
  `,
})
export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
}
```
