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
    "if_with_alias.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /if_with_alias.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @if (value(); as alias) {
        {{value()}} as {{alias}}
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
