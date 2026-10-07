# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "sourceMap": true
  },
  "files": [
    "projection.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /projection.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `
  <h3><ng-content select="title"></ng-content></h3>
  <div><ng-content></ng-content></div>`,
    standalone: false
})
export class TestCmp {
}
```
