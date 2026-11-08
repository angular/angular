# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["dir.ts", "collisions.ts", "existing_imports.ts", "property_names.ts"]
}
```

ngtsc names the `n`th namespace import it generates `i<n>` and moves it to `i<n>_1`, `i<n>_2`, …
while the source file already uses that name. It never reuses a namespace import the file already
has.

- `collisions.ts`: a top-level `const i0` and a nested arrow parameter `i1`. ngtsc names the
  `@angular/core` import `i0_1` and the `./dir` import (only the optimized output has it) `i1_1`.
- `existing_imports.ts`: user-written `import * as i0` and `import * as i1`. ngtsc adds separate
  `i0_1` and `i1_1` imports.
- `property_names.ts`: `i0` appears only as a property name. ngtsc names the import `i0_1`.

ngp doesn't do this yet. It always uses `i0`, `i1`, … and reuses a namespace import named like one,
so the output below keeps those names. In `collisions.ts` the generated `i0.ɵɵ…` references then
resolve to the number, and the file doesn't compile.

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
