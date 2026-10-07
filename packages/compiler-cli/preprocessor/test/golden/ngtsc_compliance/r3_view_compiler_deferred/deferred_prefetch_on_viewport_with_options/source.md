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
    "deferred_prefetch_on_viewport_with_options.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_prefetch_on_viewport_with_options.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (prefetch on viewport({trigger: button, rootMargin: '123px', threshold: 59})) {
      {{message}}
    } @placeholder {
      <button #button>Click me</button>
    }
  `,
})
export class MyApp {
  message = 'hello';
}
```
