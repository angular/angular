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
    "let_shared_with_child_view.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_shared_with_child_view.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let value = 123;
    {{value}}
    <ng-template>{{value}}</ng-template>
  `,
})
export class MyApp {}
```
