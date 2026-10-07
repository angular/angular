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
    "let_local_forward_refs.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_local_forward_refs.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let message = 'Hello, ' + name.value;
    {{message}}
    <input #name>
  `,
})
export class MyApp {}
```
