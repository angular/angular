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
    "event_host_explicit_access.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /event_host_explicit_access.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    host: {
        '(click)': 'c(this.$event)',
    },
    standalone: false
})
class Dir {
  $event = {};
  c(value: {}) {}
}
```
