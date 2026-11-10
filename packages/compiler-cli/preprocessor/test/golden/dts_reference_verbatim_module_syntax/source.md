# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "verbatimModuleSyntax": true,
    "moduleResolution": "bundler",
    "target": "es2022",
    "module": "es2022",
    "lib": ["es2022", "dom"]
  },
  "files": ["lib/dir.ts", "lib/index.ts", "type_param.ts", "barrel.ts", "host_directive.ts"]
}
```

ngtsc adds an import that only `.d.ts` types use to the `.d.ts` alone. ngp writes one import for
both outputs, so under `verbatimModuleSyntax`, which keeps every value import in the JavaScript,
ngp imports a namespace that only types use as `import type * as iN`. A namespace the
JavaScript uses stays a value import.

# /node_modules/typeonly-pkg/package.json
```json
{
  "name": "typeonly-pkg",
  "types": "index.d.ts"
}
```

# /node_modules/typeonly-pkg/index.d.ts
```ts
export interface Item {
  id: string;
}
```

# /lib/dir.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: '[dir]'})
export class Dir {}
```

# /lib/index.ts
```ts
export {Dir} from './dir';
```

An input transform parameter type.

# /type_param.ts
```ts
import {Component, Input} from '@angular/core';
import type {Item} from 'typeonly-pkg';

export function map(v: Item | null): string[] {
  return [];
}

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: map}) items: string[] = [];
}
```

A symbol reached through a barrel, named only by `ɵmod`.

# /barrel.ts
```ts
import {NgModule} from '@angular/core';
import {Dir} from './lib/index';

@NgModule({imports: [Dir], exports: [Dir]})
export class M {}
```

A host directive, which `ɵɵHostDirectivesFeature` names in the JavaScript as well.

# /host_directive.ts
```ts
import {Component} from '@angular/core';
import {Dir} from './lib/index';

@Component({selector: 'c', template: '', hostDirectives: [Dir]})
export class C {}
```
