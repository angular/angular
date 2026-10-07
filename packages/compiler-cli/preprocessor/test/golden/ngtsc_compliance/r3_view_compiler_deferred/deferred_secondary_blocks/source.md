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
    "deferred_secondary_blocks.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_secondary_blocks.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @defer {
        <button></button>
      } @loading {
        {{loadingMessage}}
      } @placeholder {
        <img src="loading.gif">
      } @error {
        Calendar failed to load <i>sad</i>
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  loadingMessage = 'Calendar is loading';
}
```
