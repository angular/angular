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
    "simple_let.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /simple_let.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let result = value * 2;
    The result is {{result}}
  `,
})
export class MyApp {
  value = 1;
}
```
