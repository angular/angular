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
    "defer_with_hydrate_triggers.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /defer_with_hydrate_triggers.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (
      hydrate when isVisible() || isReady;
      hydrate on idle, timer(1337);
      hydrate on immediate, hover;
      hydrate on interaction;
      hydrate on viewport) {
      {{message}}
    }
  `,
})
export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
}
```
