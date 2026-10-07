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
    "let_in_i18n_and_child_view.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_in_i18n_and_child_view.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <div i18n>
      @let result = value * 2;
      The result is {{result}}
      <ng-template>To repeat, the result is {{result}}</ng-template>
    </div>
  `,
})
export class MyApp {
  value = 1;
}
```
