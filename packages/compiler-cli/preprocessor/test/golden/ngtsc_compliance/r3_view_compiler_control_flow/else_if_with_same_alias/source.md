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
    "else_if_with_same_alias.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /else_if_with_same_alias.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @if (one; as alias) {
        {{alias}}
      } @else if (two; as alias) {
        {{alias}}
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  one = false;
  two = 2;
}
```
