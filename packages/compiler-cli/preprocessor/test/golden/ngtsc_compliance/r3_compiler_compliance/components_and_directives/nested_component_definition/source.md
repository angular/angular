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
    "nested_component_definition.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nested_component_definition.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: 'outer',
})
class Outer {
  constructor() {
    @Component({
      template: 'inner',
    })
    class Inner {}
  }
}
```
