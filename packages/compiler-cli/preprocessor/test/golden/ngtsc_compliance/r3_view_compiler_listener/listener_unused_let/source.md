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
    "listener_unused_let.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /listener_unused_let.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let foo = 123;
    <button (click)="noop()"></button>
    {{foo}}
  `,
})
export class TestCmp {
  noop() {}
}
```
