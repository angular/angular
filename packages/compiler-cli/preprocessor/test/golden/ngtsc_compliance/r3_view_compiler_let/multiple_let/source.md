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
    "multiple_let.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /multiple_let.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let one = value + 1;
    @let two = one + 1;
    @let result = two + 1;
    The result is {{result}}
  `,
})
export class MyApp {
  value = 1;
}
```
