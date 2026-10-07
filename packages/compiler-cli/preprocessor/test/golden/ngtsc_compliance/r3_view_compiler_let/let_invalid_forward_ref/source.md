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
    "let_invalid_forward_ref.ts"
  ],
  "angularCompilerOptions": {
    "checkTemplateBodies": false
  }
}
```

# /let_invalid_forward_ref.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <ng-template>
      {{result}}
      @let result = value * 2;
    </ng-template>
  `,
})
export class MyApp {
  value = 1;
}
```
