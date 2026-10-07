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
    "switch_multiple_cases.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /switch_multiple_cases.ts
```ts
import { Component } from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (-1) {}
        @case (0) @case(1) {
          case 01
        }
        @case (2) {
          case 2
        }
        @default {
          default
        }
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';

  value() {
    return 1;
  }
}
```
