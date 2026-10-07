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
    "aria_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /aria_properties.ts
```ts
import {Component, Directive} from '@angular/core';

@Directive({selector: '[myDir]'})
class MyDir {}

@Component({
  template: `
    <input myDir [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
  `,
  imports: [MyDir],
})
export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
}
```
