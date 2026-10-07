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
    "simple_element.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /simple_element.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<h1>Heading 1</h1>',
    standalone: false
})
export class TestCmp {
}
```
