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
    "deferred_interaction_same_view_trigger.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_interaction_same_view_trigger.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {}

    <div>
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
```
