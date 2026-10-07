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
    "defer_hydrate_order.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /defer_hydrate_order.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @defer (when isReady; hydrate on timer(1337); prefetch on viewport) {
      Hello
    } @placeholder {
      <span>Placeholder</span>
    }
  `,
})
export class MyApp {
  isReady = true;
}
```
