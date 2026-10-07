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
    "empty_switch.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /empty_switch.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @switch (message) {}
      {{message}}
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
```
