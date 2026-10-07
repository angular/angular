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
    "deferred_with_implicit_triggers.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_implicit_triggers.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @defer (on hover, interaction, viewport; prefetch on hover, interaction, viewport) {
      {{message}}
    } @placeholder {
      <button>Click me</button>
    }
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
```
