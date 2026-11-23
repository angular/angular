# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["consts.ts", "host.ts"]
}
```

# /consts.ts
```ts
export const IMPORTED_CLASS = 'from-import';
```

# /host.ts
```ts
import { Component, HostBinding } from '@angular/core';
import { IMPORTED_CLASS } from './consts';

const ACTIVE_CLASS = 'is-active';
const ROLE_ATTR = 'attr.role';

@Component({ selector: 'my-comp', template: '' })
export class MyComp {
  private _ready = false;

  // TypeScript only allows decorating the first accessor of a pair, often the setter.
  @HostBinding('class.ready')
  set isReady(v: boolean) {
    this._ready = v;
  }
  get isReady(): boolean {
    return this._ready;
  }

  // A template literal with substitutions folds to `class.is-active`.
  @HostBinding(`class.${ACTIVE_CLASS}`)
  active = true;

  // A constant folds to `attr.role`.
  @HostBinding(ROLE_ATTR)
  role = 'button';

  // An imported constant resolves in optimized (whole-program) mode. The unoptimized mode is
  // single-file, so it cannot follow the import and drops the binding without a diagnostic.
  @HostBinding(`class.${IMPORTED_CLASS}`)
  imported = true;
}
```
