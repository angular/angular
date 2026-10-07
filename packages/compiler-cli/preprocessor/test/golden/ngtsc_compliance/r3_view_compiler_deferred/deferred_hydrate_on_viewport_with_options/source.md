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
    "deferred_hydrate_on_viewport_with_options.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_hydrate_on_viewport_with_options.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (hydrate on viewport({rootMargin: '123px', threshold: 59})) {
      {{message}}
    }
  `,
})
export class MyApp {
  message = 'hello';
}
```
