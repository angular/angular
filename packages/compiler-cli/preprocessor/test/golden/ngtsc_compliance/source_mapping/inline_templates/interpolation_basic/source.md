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
    "interpolation_basic.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /interpolation_basic.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<h3>Hello {{ name }}</h3>',
    standalone: false
})
export class TestCmp {
  name: string = '';
}
```
