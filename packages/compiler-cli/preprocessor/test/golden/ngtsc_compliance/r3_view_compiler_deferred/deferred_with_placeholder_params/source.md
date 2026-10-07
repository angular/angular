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
    "deferred_with_placeholder_params.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_placeholder_params.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @defer {
      <button></button>
    } @placeholder (minimum 2s) {
      <img src="placeholder.gif">
    }
  `,
    standalone: false
})
export class MyApp {
}
```
