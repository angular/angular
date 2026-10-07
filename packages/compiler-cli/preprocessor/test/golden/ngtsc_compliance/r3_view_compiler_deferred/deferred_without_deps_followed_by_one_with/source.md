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
    "deferred_without_deps_followed_by_one_with.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_without_deps_followed_by_one_with.ts
```ts
import {Component, Directive} from '@angular/core';

@Directive({
  selector: 'lazy-dep',
})
export class LazyDep {
}

@Component({
  template: `
    <div>
      @defer {
        I'm so independent!
      }
      @defer {
        <lazy-dep/>
      }
    </div>
  `,
  imports: [LazyDep],
})
export class MyApp {
}
```
