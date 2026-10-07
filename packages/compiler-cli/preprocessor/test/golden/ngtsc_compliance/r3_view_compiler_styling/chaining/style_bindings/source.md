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
    "style_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /style_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `<div
    [style.color]="color"
    [style.border]="border"
    [style.transition]="transition"></div>`,
    standalone: false
})
export class MyComponent {
  color = 'red';
  border = '1px solid purple';
  transition = 'all 1337ms ease';
}
```
