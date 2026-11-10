# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "emitDeclarationOnly": true,
    "isolatedDeclarations": true
  },
  "angularCompilerOptions": {
    "_experimentalAllowEmitDeclarationOnly": true
  },
  "files": [
    "permissions_checker.ts",
    "lib/dir.ts",
    "lib/root.ts",
    "lib/index.ts",
    "lib/dflt.ts",
    "lib/dflt2.ts",
    "a/task.ts",
    "b/task.ts",
    "deprecated.ts",
    "shared.ts",
    "barrel.ts",
    "same_name.ts",
    "deprecated_alias.ts",
    "host_inputs.ts",
    "unresolved_ngmodule.ts",
    "unresolved_host.ts",
    "default_imports.ts",
    "namespace_transform.ts",
    "for_root.ts",
    "tuples.ts"
  ]
}
```

# /permissions_checker.ts
```ts
import {Component, EventEmitter, NgModule, Output, forwardRef} from '@angular/core';
import {AveLoggingModule} from '@external/ave-logging';
import {FooModule, provideFoo} from '@external/foo';
import {ForwardModule} from '@external/forward';

export interface PermissionsCheckerState {
  allowed: boolean;
}

@Component({
  selector: 'permissions-checker',
  template: '<div>Permissions</div>',
  standalone: false,
})
export class PermissionsChecker {
  @Output() readonly stateChange = new EventEmitter<PermissionsCheckerState>();
}

@NgModule({})
export class LocalHelperModule {}

function getLocalImports() {
  return [LocalHelperModule];
}

const NG_MODULE_IMPORTS = [AveLoggingModule];

@NgModule({
  declarations: [PermissionsChecker],
  imports: [
    NG_MODULE_IMPORTS,
    FooModule.forRoot(),
    provideFoo(),
    getLocalImports(),
    forwardRef(() => ForwardModule),
  ],
  exports: [PermissionsChecker],
})
export class PermissionsCheckerModule {}
```

ngtsc runs declaration-only emission as local compilation, with or without
`compilationMode: 'experimental-local'`, so it gives the same output for `golden.md` and
`golden.opt.md`. There,
`resolvedToTypeTupleElement` emits a reference without `ImportFlags.ForceNewImport`, and
`TypeTranslatorVisitor`'s `routeEntityNameThroughImportManager` writes an identifier through
the import that binds it: the specifier stays as written, but the symbol is named by the name
ngtsc's `getExportedName` reads for the binding, behind a fresh `import * as iN`.

# /lib/dir.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: '[dir]'})
export class Dir {}
```

# /lib/root.ts
```ts
import {ModuleWithProviders, NgModule} from '@angular/core';

@NgModule({})
export class RootModule {
  static forRoot(): ModuleWithProviders<RootModule> {
    return {ngModule: RootModule};
  }
}
```

# /lib/index.ts
```ts
export {Dir} from './dir';
export {RootModule} from './root';
```

# /lib/dflt.ts
```ts
import {NgModule} from '@angular/core';

@NgModule({})
export default class DfltModule {}
```

# /lib/dflt2.ts
```ts
import {NgModule} from '@angular/core';

@NgModule({})
export default class Dflt2Module {}
```

# /a/task.ts
```ts
import {Component} from '@angular/core';

@Component({selector: 'a-task', template: ''})
export class TaskDetail {}
```

# /b/task.ts
```ts
import {Component} from '@angular/core';

@Component({selector: 'b-task', template: ''})
export class TaskDetail {}
```

# /deprecated.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: '[real]'})
export class RealDir {}

export {RealDir as OldDir};

export const IMPORTED_INPUTS = ['x'];
```

# /shared.ts
```ts
import {Dir} from './lib/index';
import {RootModule} from './lib';

export const SHARED = [Dir, RootModule.forRoot()];
```

ngtsc keeps the barrel specifier of a symbol imported through a barrel.

# /barrel.ts
```ts
import {NgModule} from '@angular/core';
import {Dir} from './lib/index';

@NgModule({imports: [Dir], exports: [Dir]})
export class M {}
```

ngtsc names two symbols with the same exported name each by their exported name, under their own
import.

# /same_name.ts
```ts
import {NgModule} from '@angular/core';
import {TaskDetail} from './a/task';
import {TaskDetail as TaskDetailOld} from './b/task';

@NgModule({imports: [TaskDetail, TaskDetailOld]})
export class M {}
```

ngtsc resolves a host directive to its declaration, so it names one imported through a deprecated
re-export alias by the name its declaring file exports.

# /deprecated_alias.ts
```ts
import {Directive} from '@angular/core';
import {OldDir} from './deprecated';

@Directive({selector: '[x]', hostDirectives: [OldDir]})
export class X {}
```

The same when another entry depends on a value from another file. `TODO(parity)`: ngtsc
evaluates `IMPORTED_INPUTS` and types the `LocalDir` entry's inputs as `{'x': 'x'}`, where ngp
writes `{}`.

# /host_inputs.ts
```ts
import {Component, Directive, Input} from '@angular/core';
import {OldDir, IMPORTED_INPUTS} from './deprecated';

@Directive({selector: '[loc]'})
export class LocalDir {
  @Input() x: any;
}

@Component({
  selector: 'c',
  template: '',
  hostDirectives: [OldDir, {directive: LocalDir, inputs: IMPORTED_INPUTS}],
})
export class Cmp {}
```

ngtsc writes an import nothing resolves as the import itself, named by its imported name.

# /unresolved_ngmodule.ts
```ts
import {NgModule} from '@angular/core';
// @ts-ignore
import {AwesomechartsModule as Ng2AwesomechartsModule} from 'ng2-awesomecharts';
// @ts-ignore
import {Plain} from 'plain-lib';

@NgModule({imports: [Ng2AwesomechartsModule, Plain]})
export class M {}
```

# /unresolved_host.ts
```ts
import {Directive} from '@angular/core';
// @ts-ignore
import {Grid as AliasGrid} from 'google3/some/grid/';
// @ts-ignore
import {Plain} from 'plain-lib';

@Directive({selector: '[x]', hostDirectives: [AliasGrid, Plain]})
export class X {}
```

ngtsc's `getExportedName` names a default import by its local name, which `./lib/dflt` doesn't
export, and `import {default as D2}` by `default`. The first is an ngtsc quirk reproduced for
raw parity.

# /default_imports.ts
```ts
import {NgModule} from '@angular/core';
import Dflt from './lib/dflt';
import {default as D2} from './lib/dflt2';

@NgModule({imports: [Dflt, D2]})
export class M {}
```

Deliberate divergence: ngtsc's `getExportedName` names a namespace import by its local name, so
ngtsc writes `Parameters<typeof i1.u.toNum>[0]`, which `ext-lib` doesn't export. ngp keeps the
transform reference as written instead.

# /namespace_transform.ts
```ts
import {Component, Input} from '@angular/core';
// @ts-ignore
import * as u from 'ext-lib';

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: u.toNum}) n = 0;
}
```

ngtsc keeps the syntactic form of a `ModuleWithProviders` call, written through the import that
binds its receiver. Deliberate divergence: through a namespace import ngtsc writes
`ReturnType<typeof i1.lib.RootModule.forRoot>`, which `./lib` doesn't export. ngp keeps the
namespace form as written instead.

# /for_root.ts
```ts
import {NgModule} from '@angular/core';
import {RootModule} from './lib';
import * as lib from './lib';

@NgModule({imports: [RootModule.forRoot()]})
export class M {}

@NgModule({imports: [lib.RootModule.forRoot()]})
export class NsM {}
```

ngtsc writes an imported array as a nested tuple of the references it resolves to.

# /tuples.ts
```ts
import {NgModule} from '@angular/core';
import {Dir} from './lib/index';
import {SHARED} from './shared';

@NgModule({imports: [SHARED, Dir], exports: [SHARED]})
export class M {}
```
