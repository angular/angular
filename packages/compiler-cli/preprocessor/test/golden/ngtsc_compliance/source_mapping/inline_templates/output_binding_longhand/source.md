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
    "output_binding_longhand.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /output_binding_longhand.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<button on-click="doSomething()">Do it</button>',
    standalone: false
})
export class TestCmp {
  doSomething() {}
}
```
