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
    "let_local_refs.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_local_refs.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <input #name>
    <input #lastName>

    @let fullName = name.value + ' ' + lastName.value;
    Hello, {{fullName}}
  `,
})
export class MyApp {}
```
