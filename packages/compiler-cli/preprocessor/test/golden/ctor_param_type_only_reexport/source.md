# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

Every constructor parameter below names a real class, but only some reach it through files that
all export a value. The others pass through a barrel that hands the class on in type position only
(binding it with `import type`, or exporting it with `export type` or `export { type … }`, renamed
or not), so the consumer's binding has no runtime value and the emitted metadata `type` must keep
its `@ts-ignore` even in optimize mode, which otherwise drops the guard for a resolved class.

The value parameters sit between the guarded ones: a guard must not reach past its own parameter.

# /classes.ts
```ts
export class Direct {}
export class ImportedAsType {}
export class ExportedAsType {}
export class InlineExportedAsType {}
export class ReexportedAsType {}
export class RenamedAsType {}
export class RenamedValue {}
```

# /barrel.ts
```ts
import type { ImportedAsType } from './classes';
import { ExportedAsType, InlineExportedAsType, RenamedAsType, RenamedValue } from './classes';

export { Direct } from './classes';
export { ImportedAsType };
export type { ExportedAsType };
export { type InlineExportedAsType };
export type { ReexportedAsType } from './classes';
export type { RenamedAsType as RenamedType };
export { RenamedValue as Renamed };

class DeclaredAsType {}
export type { DeclaredAsType };
```

# /forward.ts
```ts
export { ImportedAsType as ForwardedAsType, Direct as ForwardedDirect } from './barrel';
```

# /node_modules/pkg/package.json
```json
{ "name": "pkg", "types": "index.d.ts" }
```

# /node_modules/pkg/classes.d.ts
```ts
export declare class PkgAsType {}
export declare class PkgValue {}
```

# /node_modules/pkg/index.d.ts
```ts
import { PkgAsType } from './classes';
export type { PkgAsType };
export { PkgValue } from './classes';
```

# /app.ts
```ts
import { Injectable } from '@angular/core';
import {
  Direct,
  ImportedAsType,
  ExportedAsType,
  InlineExportedAsType,
  ReexportedAsType,
  DeclaredAsType,
  RenamedType,
  Renamed,
} from './barrel';
import * as barrel from './barrel';
import { ForwardedAsType, ForwardedDirect } from './forward';
import { PkgAsType, PkgValue } from 'pkg';

@Injectable({ providedIn: 'root' })
export class BarrelService {
  constructor(
    private readonly importedAsType: ImportedAsType,
    private readonly direct: Direct,
    private readonly exportedAsType: ExportedAsType,
    private readonly renamed: Renamed,
    private readonly inlineExportedAsType: InlineExportedAsType,
    private readonly reexportedAsType: ReexportedAsType,
    private readonly declaredAsType: DeclaredAsType,
    private readonly renamedType: RenamedType,
    private readonly forwardedAsType: ForwardedAsType,
    private readonly forwardedDirect: ForwardedDirect,
    private readonly qualifiedAsType: barrel.ExportedAsType,
    private readonly qualifiedDirect: barrel.Direct,
    private readonly pkgAsType: PkgAsType,
    private readonly pkgValue: PkgValue,
  ) {}
}
```
