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
    "mixed_query_variants.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /mixed_query_variants.ts
```ts
import {ContentChild, contentChild, Directive, ViewChild, viewChild} from '@angular/core';

@Directive({
})
export class TestDir {
  @ViewChild('locator1') decoratorViewChild: unknown;
  signalViewChild = viewChild('locator1');

  @ContentChild('locator2') decoratorContentChild: unknown;
  signalContentChild = contentChild('locator2');
}
```
