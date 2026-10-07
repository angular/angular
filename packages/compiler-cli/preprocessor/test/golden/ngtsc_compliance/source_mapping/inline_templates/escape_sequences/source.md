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
    "escape_sequences.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /escape_sequences.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div class=\"some-class\">this is a test</div>',
    standalone: false
})
export class TestCmp {
}
```
