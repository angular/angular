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
    "let_preceded_by_i18n.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_preceded_by_i18n.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <div i18n>Hello {{value}}</div>
    @let result = value * 2;
    <ng-template>The result is {{result}}</ng-template>
  `,
})
export class MyApp {
  value = 1;
}
```
