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
    "deferred_with_loading_params.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_loading_params.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @defer {
      <button></button>
    } @loading(minimum 2s; after 500ms) {
      <img src="loading.gif">
    }
  `,
    standalone: false
})
export class MyApp {
}
```
