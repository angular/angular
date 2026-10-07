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
    "deferred_with_external_deps.ts",
    "deferred_with_external_deps_eager.ts",
    "deferred_with_external_deps_lazy.ts",
    "deferred_with_external_deps_loading.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_external_deps.ts
```ts
import {Component} from '@angular/core';

import {EagerDep} from './deferred_with_external_deps_eager';
import {LazyDep} from './deferred_with_external_deps_lazy';
import {LoadingDep} from './deferred_with_external_deps_loading';

@Component({
  template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `,
  imports: [EagerDep, LazyDep, LoadingDep],
})
export class MyApp {
}
```

# /deferred_with_external_deps_eager.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: 'eager-dep'})
export class EagerDep {
}
```

# /deferred_with_external_deps_lazy.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: 'lazy-dep',})
export class LazyDep {
}
```

# /deferred_with_external_deps_loading.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: 'loading-dep'})
export class LoadingDep {
}
```
