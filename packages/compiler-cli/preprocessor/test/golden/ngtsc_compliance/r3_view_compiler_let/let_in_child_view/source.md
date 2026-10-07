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
    "let_in_child_view.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_in_child_view.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @if (true) {
      @if (true) {
        @let three = two + 1;
        {{three}}
      }
      @let two = one + 1;
    }

    @let one = 1;
  `,
})
export class MyApp {}
```
