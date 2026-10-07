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
    "output_binding_complex.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /output_binding_complex.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `<button (click)="items.push('item' + items.length)">Add Item</button>`,
    standalone: false
})
export class TestCmp {
  items: string[] = [];
}
```
