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
    "object_literal_spread.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /object_literal_spread.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let simple = {...foo};
    @let otherProps = {a: 1, ...foo, b: 2};
    @let multipleSpreads = {...foo, a: 1, ...bar, ...baz, b: 2};
    @let objectLiteral = {a: 1, ...{b: {...{c: 3}}}};

    <!-- Use the objects so they don't get flagged as unused. -->
    {{simple}} {{otherProps}} {{multipleSpreads}} {{objectLiteral}}
  `,
})
export class ObjectComp {
  foo = {};
  bar = {};
  baz = {};
}
```
