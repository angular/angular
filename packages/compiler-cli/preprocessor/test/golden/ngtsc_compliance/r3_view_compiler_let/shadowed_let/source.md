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
    "shadowed_let.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /shadowed_let.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let value = 'parent';

    @if (true) {
      @let value = 'local';
      The value comes from {{value}}
    }
  `,
})
export class MyApp {}
```
