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
    "event_explicit_access.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /event_explicit_access.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: '<div (click)="c(this.$event)"></div>',
    standalone: false
})
class Comp {
  $event = {};

  c(value: {}) {}
}
```
