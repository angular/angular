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
    "aria_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /aria_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: ``,
  host: {
    '[attr.aria-disabled]': 'disabled',
    '[aria-readonly]': 'readonly',
    '[ariaLabel]': 'label',
  },
})
export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
}
```
