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
    "this_any_access.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /this_any_access.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: '<div [tabIndex]="this.$any(null)"></div>',
    standalone: false
})
class Comp {
  $any(value: null): any {
    return value as any;
  }
}
```
