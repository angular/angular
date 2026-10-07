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
    "deferred_with_local_deps.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_with_local_deps.ts
```ts
import {Component, Directive} from '@angular/core';

@Directive({selector: 'eager-dep'})
export class EagerDep {
}

@Directive({selector: 'lazy-dep'})
export class LazyDep {
}

@Directive({selector: 'loading-dep'})
export class LoadingDep {
}

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
