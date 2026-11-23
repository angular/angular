# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "onlyExplicitDeferDependencyImports": true
  },
  "files": ["implicit.component.ts", "explicit.component.ts", "comp-a.ts", "comp-b.ts"]
}
```

# /comp-a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-a',
  template: 'Component A',
})
export class CompA {}
```

# /comp-b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-b',
  template: 'Component B',
})
export class CompB {}
```

# /implicit.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a';

// `CompA` is only used inside `@defer`, but reaches the component through `imports`. With
// `onlyExplicitDeferDependencyImports` it must not be defer-loaded: the static import stays and,
// under full compilation, the `@defer` dependency function references it directly.
@Component({
  selector: 'implicit-comp',
  imports: [CompA],
  template: `
    @defer {
      <comp-a />
    }
  `,
})
export class ImplicitComponent {}
```

# /explicit.component.ts
```ts
import { Component } from '@angular/core';
import { CompB } from './comp-b';

// `CompB` is listed in `deferredImports`, so it is still defer-loaded under the flag.
@Component({
  selector: 'explicit-comp',
  deferredImports: {
    blockB: [CompB],
  },
  template: `
    @defer (name blockB) {
      <comp-b />
    }
  `,
})
export class ExplicitComponent {}
```
