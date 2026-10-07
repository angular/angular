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
    "query_in_component.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /query_in_component.ts
```ts
import {Component, contentChild, contentChildren, viewChild, viewChildren} from '@angular/core';

@Component({
  template: 'Works',
})
export class TestComp {
  query1 = viewChild('locatorA');
  query2 = viewChildren('locatorB');
  query3 = contentChild('locatorC');
  query4 = contentChildren('locatorD');
}
```
