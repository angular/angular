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
    "deferred_on_viewport_with_options.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_on_viewport_with_options.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (on viewport({trigger: button, rootMargin: '123px', threshold: 59})) {
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
