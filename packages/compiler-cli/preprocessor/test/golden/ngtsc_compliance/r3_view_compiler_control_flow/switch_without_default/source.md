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
    "switch_without_default.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /switch_without_default.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          case 1
        }
        @case (2) {
          case 2
        }
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  value = () => 1;
}
```
