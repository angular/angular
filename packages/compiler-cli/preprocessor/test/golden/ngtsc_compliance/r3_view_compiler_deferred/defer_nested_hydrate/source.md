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
    "defer_nested_hydrate.ts",
    "defer_nested_hydrate_inner.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /defer_nested_hydrate.ts
```ts
import {Component} from '@angular/core';

import {InnerCmp} from './defer_nested_hydrate_inner';

@Component({
  selector: 'my-app',
  imports: [InnerCmp],
  template: `
    @defer (on idle) {
      <inner-cmp />
    }
  `,
})
export class MyApp {}
```

# /defer_nested_hydrate_inner.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'inner-cmp',
  template: `
    @defer (hydrate on idle) {
      hello
    }
  `,
})
export class InnerCmp {
}
```
