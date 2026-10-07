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
    "deferred_with_duplicate_external_dep.ts",
    "deferred_with_duplicate_external_dep_lazy.ts",
    "deferred_with_duplicate_external_dep_other.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_duplicate_external_dep.ts
```ts
import {Component} from '@angular/core';
import {DuplicateLazyDep} from './deferred_with_duplicate_external_dep_lazy';
import {OtherLazyDep} from './deferred_with_duplicate_external_dep_other';

@Component({
  template: `
    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <other-lazy-dep/>
    }
  `,
  imports: [DuplicateLazyDep, OtherLazyDep],
})
export class MyApp {}
```

# /deferred_with_duplicate_external_dep_lazy.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: 'duplicate-lazy-dep'})
export class DuplicateLazyDep {}
```

# /deferred_with_duplicate_external_dep_other.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: 'other-lazy-dep'})
export class OtherLazyDep {}
```
