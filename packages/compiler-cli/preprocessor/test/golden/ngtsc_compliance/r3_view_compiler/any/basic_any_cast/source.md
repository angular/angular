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
    "basic_any_cast.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /basic_any_cast.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: '<div [tabIndex]="$any(10)"></div>',
    standalone: false
})
class Comp {
}
```
