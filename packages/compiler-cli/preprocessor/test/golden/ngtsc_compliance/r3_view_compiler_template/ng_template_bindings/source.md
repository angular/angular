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
    "ng_template_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_template_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: '<ng-template l="l1" [p]="p1" [attr.a]="a1" [class.c]="c1"></ng-template>',
})
export class MyComponent {
  p1!: any;
  a1!: any;
  c1!: any;
}
```
