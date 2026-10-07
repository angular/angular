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
    "deferred_interaction_placeholder_trigger.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_interaction_placeholder_trigger.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {
      Main
    } @placeholder {
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    }
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
```
