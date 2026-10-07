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
    "update_mode.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /update_mode.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div>this is a test</div><div>{{ 1 + 2 }}</div>',
    standalone: false
})
export class TestCmp {
}
```
