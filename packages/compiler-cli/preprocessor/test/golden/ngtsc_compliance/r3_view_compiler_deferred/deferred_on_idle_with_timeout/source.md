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
    "deferred_on_idle_with_timeout.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_on_idle_with_timeout.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @defer (on idle(500ms)) {
      {{message}}
    } @placeholder {
      <p>Placeholder</p>
    }
  `,
})
export class MyApp {
  message = 'hello';
}
```
