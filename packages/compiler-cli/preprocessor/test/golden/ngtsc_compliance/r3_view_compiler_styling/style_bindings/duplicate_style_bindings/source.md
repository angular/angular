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
    "duplicate_style_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /duplicate_style_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div style="width: 1px; width: 10px;" class="cls1 cls1"></div>
  `,
})
export class MyComponent {
}
```
