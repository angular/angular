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
    "debug_info.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /debug_info.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: 'Hello Angular!',
})
export class Main {
}

@Component({
  template: 'Hello Angular!',
})
export class MainStandalone {
}
```
