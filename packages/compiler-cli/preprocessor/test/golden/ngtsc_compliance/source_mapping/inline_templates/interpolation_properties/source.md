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
    "interpolation_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /interpolation_properties.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div id="{{name}}"></div>',
    standalone: false
})
export class TestCmp {
  name: string = '';
}
```
