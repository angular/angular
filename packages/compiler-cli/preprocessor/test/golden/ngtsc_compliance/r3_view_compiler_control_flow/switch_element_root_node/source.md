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
    "switch_element_root_node.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /switch_element_root_node.ts
```ts
import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[binding]'})
export class Binding {
  @Input() binding = 0;
}

@Component({
  template: `
    @switch (expr) {
      @case (0) {
        <div foo="1" bar="2" [binding]="3">{{expr}}</div>
      }
      @case (1) {
        <div foo="4" bar="5" [binding]="6">{{expr}}</div>
      }
      @default {
        <div foo="7" bar="8" [binding]="9">{{expr}}</div>
      }
    }
  `,
  imports: [Binding],
})
export class MyApp {
  expr = 0;
}
```
