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
    "nested_for_tracking_function.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nested_for_tracking_function.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @for (grandparent of items; track trackByGrandparent(grandparent, $index)) {
      @for (parent of grandparent.items; track trackByParent(parent, $index)) {
        @for (child of parent.items; track trackByChild(child, $index)) {

        }
      }
    }
  `,
    standalone: false
})
export class MyApp {
  items: any[] = [];
  trackByGrandparent = (item: any, index: number) => index;
  trackByParent = (item: any, index: number) => index;
  trackByChild = (item: any, index: number) => index;
}
```
