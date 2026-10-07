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
    "deferred_when_with_pipe.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_when_with_pipe.ts
```ts
import {Component, Pipe} from '@angular/core';

@Pipe({name: 'testPipe'})
export class TestPipe {
  transform() {
    return true;
  }
}

@Component({
  template: `
    {{message}}
    @defer (when isVisible() && (isReady | testPipe)) {
      Hello
    }
  `,
  imports: [TestPipe],
})
export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
}
```
