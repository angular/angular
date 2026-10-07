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
    "basic_if_else.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /basic_if_else.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @if (value()) {
        hello
      } @else {
        goodbye
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
