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
    "basic_deferred.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /basic_deferred.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @defer {Deferred content}
      <p>Content after defer block</p>
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
```
