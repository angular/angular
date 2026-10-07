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
    "deferred_with_triggers.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_triggers.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    {{message}}
    @defer (
      when isVisible() || isReady;
      on idle, timer(1337);
      on immediate, hover(button);
      on interaction(button);
      on viewport(button)) {
        {{message}}
      } @placeholder {
        <button #button>Click me</button>
      }
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
}
```
