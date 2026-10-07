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
    "interpolation_complex.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /interpolation_complex.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<h2>{{ greeting + " " + name }}</h2>',
    standalone: false
})
export class TestCmp {
  greeting: string = '';
  name: string = '';
}
```
