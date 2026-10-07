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
    "ng_template_implicit.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_template_implicit.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<ng-template let-a [ngIf]="true">{{a}}</ng-template>',
})
export class MyComponent {
  p1!: any;
  a1!: any;
  c1!: any;
}
```
