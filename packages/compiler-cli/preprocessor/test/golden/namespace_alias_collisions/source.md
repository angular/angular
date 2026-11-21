# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "dir.ts",
    "collisions.ts",
    "existing_imports.ts",
    "inline_tcb.ts",
    "inline_tcb_dir.ts",
    "property_names.ts"
  ]
}
```

ngtsc names the `n`th namespace import it generates `i<n>` and moves it to `i<n>_1`, `i<n>_2`, …
while the source file already uses that name. It never reuses a namespace import the file already
has. ngp applies the same rule to the file's bindings: every name it declares, at any depth, and
every global it references.

- `collisions.ts`: the top-level `const i0` moves the `@angular/core` import to `i0_1`. Without
  that, the generated `i0.ɵɵ…` references would resolve to the number and the file wouldn't
  compile. The nested arrow parameter `i1` can't capture a generated reference, but ngtsc avoids
  it too, so the `./dir` import (only the optimized output has it) moves to `i1_1`.
- `existing_imports.ts`: the user-written `import * as i0` and `import * as i1` aren't reused, so
  the generated imports are `i0_1` and `i1_1`.
- `inline_tcb.ts`: `InlineCmp` is unexported (`requiresInline: true`), so its `.ngtypecheck.ts`
  inlines `sourceContent` alongside `TcbImportManager`'s imports; `const i0` moves the
  `./inline_tcb_dir` import to `i0_1` so the `.ngtypecheck.ts` compiles cleanly.
- `property_names.ts`: `i0` is only a property name, not a binding, so the generated import keeps
  `i0`. ngtsc counts every identifier in the file and names it `i0_1`. This divergence is
  deliberate; see the `TODO(parity)` on `namespace_alias_conflicts` in `ng-analyze`.

# /dir.ts
```ts
import { Directive, NgModule } from '@angular/core';

@Directive({ selector: '[dir]', standalone: false })
export class Dir {}

@NgModule({ declarations: [Dir], exports: [Dir] })
export class DirModule {}
```

# /collisions.ts
```ts
import { Component } from '@angular/core';
import { DirModule } from './dir';

const i0 = 1;

export interface Incident {
  stage: string;
}

@Component({ selector: 'cmp', template: '<div dir></div>', imports: [DirModule] })
export class Cmp {
  v = i0;

  same(a: Incident[]) {
    return a.every((i1: Incident) => i1.stage === a[0].stage);
  }
}
```

# /existing_imports.ts
```ts
import { Component } from '@angular/core';
import * as i0 from '@angular/core';
import { DirModule } from './dir';
import * as i1 from './dir';

@Component({ selector: 'existing', template: '<div dir></div>', imports: [DirModule] })
export class Existing {
  version = i0.VERSION;
  readonly dir = i1.Dir;
}
```

# /inline_tcb.ts
```ts
import { Component } from '@angular/core';
import { StandaloneDir } from './inline_tcb_dir';

const i0 = 1;

@Component({ selector: 'inline-cmp', template: '<div [sdir]="\'ok\'"></div>', imports: [StandaloneDir] })
class InlineCmp {
  v = i0;
}
```

# /inline_tcb_dir.ts
```ts
import { Directive, Input } from '@angular/core';

@Directive({ selector: '[sdir]' })
export class StandaloneDir {
  @Input() sdir = '';
}
```

# /property_names.ts
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Settings {
  readonly flags = { i0: true };

  enabled() {
    return this.flags.i0;
  }
}
```
