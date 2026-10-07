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
    "for_element_root_node.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_element_root_node.ts
```ts
import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[binding]'})
export class Binding {
  @Input() binding = 0;
}

@Component({
  template: `
    @for (item of items; track item) {
      <div foo="1" bar="2" [binding]="3">{{item}}</div>
    } @empty {
      <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
    }
  `,
  imports: [Binding],
})
export class MyApp {
  items = [1, 2, 3];
}
```
