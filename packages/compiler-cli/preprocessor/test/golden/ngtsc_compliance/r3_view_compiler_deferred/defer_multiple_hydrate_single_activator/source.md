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
    "defer_multiple_hydrate_single_activator.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /defer_multiple_hydrate_single_activator.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @defer (hydrate on idle) {
      One
    }
    @defer (hydrate on timer(500)) {
      Two
    }
  `,
})
export class MyApp {}
```
