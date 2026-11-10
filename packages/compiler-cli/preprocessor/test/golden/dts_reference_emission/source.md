# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "moduleResolution": "bundler",
    "target": "es2022",
    "module": "es2022",
    "lib": ["es2022", "dom"],
    "paths": {
      "charts-alias": ["./charts/index"],
      "charts-dir": ["./charts/dir"]
    }
  },
  "files": [
    "lib/dir.ts",
    "lib/root.ts",
    "lib/index.ts",
    "charts/dir.ts",
    "charts/index.ts",
    "a/task.ts",
    "b/task.ts",
    "ngmodule_barrel.ts",
    "sub/parent_barrel.ts",
    "paths_alias.ts",
    "same_name.ts",
    "for_root.ts",
    "inferred_type.ts",
    "deprecated.ts",
    "barrel.ts",
    "deprecated_alias.ts",
    "package_alias.ts",
    "api.ts",
    "types/item.ts",
    "types/typeonly.ts",
    "foo.ts",
    "util.ts",
    "local_util.ts",
    "namespace_param.ts",
    "type_only_import.ts",
    "type_only_reexport.ts",
    "type_only_reexport_alias.ts",
    "imported_transform.ts",
    "imported_transform_local_type.ts"
  ]
}
```

ngtsc emits the type side of a reference in an Ivy static type through its reference emitter: a
symbol declared in another file gets a fresh `import * as iN` of its declaring module and is named
by the name that module exports, never through the consumer's own import binding. The files
below cover, in turn, each place such a type is written: the `ɵmod` lists, `hostDirectives` and
`ngAcceptInputType_*`.

ngtsc writes the `ɵmod` lists through `toR3Reference`, with `ImportFlags.ForceNewImport`.

# /lib/dir.ts
```ts
import {Directive} from '@angular/core';

export interface Thing {
  a: number;
}

export function mk(): Thing {
  return {a: 1};
}

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

# /charts/dir.ts
```ts
import {NgModule} from '@angular/core';

@NgModule({})
export class AwesomechartsModule {}

@NgModule({})
export class Other {}
```

# /charts/index.ts
```ts
export {AwesomechartsModule} from './dir';
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

ngtsc imports a symbol imported through a barrel from its declaring file.

# /ngmodule_barrel.ts
```ts
import {NgModule} from '@angular/core';
import {Dir} from './lib/index';

@NgModule({imports: [Dir], exports: [Dir]})
export class M {}
```

The same through a barrel in a parent directory.

# /sub/parent_barrel.ts
```ts
import {NgModule} from '@angular/core';
import {Dir} from '../lib';

@NgModule({imports: [Dir], exports: [Dir]})
export class M {}
```

ngtsc imports a symbol imported through a `paths` alias through the alias, the specifier the user
wrote, and names it by the name that module exports rather than by the user's local alias.

# /paths_alias.ts
```ts
import {NgModule} from '@angular/core';
import {AwesomechartsModule as Ng2AwesomechartsModule} from 'charts-alias';
import {Other} from 'charts-dir';

@NgModule({imports: [Ng2AwesomechartsModule, Other]})
export class M {}
```

ngtsc imports two symbols with the same exported name each under their exported name.

# /same_name.ts
```ts
import {NgModule} from '@angular/core';
import {TaskDetail} from './a/task';
import {TaskDetail as TaskDetailOld} from './b/task';

@NgModule({imports: [TaskDetail, TaskDetailOld]})
export class M {}
```

ngtsc resolves a `ModuleWithProviders` call to the NgModule, imported from its declaring file.

# /for_root.ts
```ts
import {NgModule} from '@angular/core';
import {RootModule} from './lib';

@NgModule({imports: [RootModule.forRoot()]})
export class M {}
```

`TODO(D4)`: TypeScript spells an inferred type through any namespace import in scope, so the
`import * as i1 from './lib/dir'` added for `ɵmod` makes the `.d.ts` that TypeScript emits from
this output declare `thing: i1.Thing`, where ngtsc, which adds its imports after TypeScript's
declaration emit, declares `thing: import("./lib/dir").Thing`.

# /inferred_type.ts
```ts
import {NgModule} from '@angular/core';
import {Dir, mk} from './lib/dir';

@NgModule({imports: [Dir]})
export class M {
  thing = mk();
}
```

ngtsc's `toHostDirectiveMetadata` emits the `directive` type of a `hostDirectives` entry through
`toR3Reference`: a fresh `import * as iN` of the declaring module, named by the name that module
exports. The compiler builds `ɵɵHostDirectivesFeature` from the type reference, so the JS names it
the same way.

# /node_modules/mylib/package.json
```json
{
  "name": "mylib",
  "typings": "index.d.ts"
}
```

# /node_modules/mylib/index.d.ts
```ts
import * as i0 from '@angular/core';

export declare class RealDir {
  static ɵdir: i0.ɵɵDirectiveDeclaration<RealDir, '[real]', never, {}, {}, never, never, true, never>;
  static ɵfac: i0.ɵɵFactoryDeclaration<RealDir, never>;
}

export { RealDir as OldDir };
```

# /deprecated.ts
```ts
import {Directive} from '@angular/core';

@Directive({selector: '[real]'})
export class RealDir {}

export {RealDir as OldDir};
```

ngtsc imports a host directive imported through a barrel from its declaring file.

# /barrel.ts
```ts
import {Component} from '@angular/core';
import {Dir} from './lib/';

@Component({selector: 'c', template: '', hostDirectives: [Dir]})
export class C {}
```

ngtsc names a host directive imported through a deprecated re-export alias by the name its
declaring file exports.

# /deprecated_alias.ts
```ts
import {Directive} from '@angular/core';
import {OldDir} from './deprecated';

@Directive({selector: '[x]', hostDirectives: [OldDir]})
export class X {}
```

ngtsc names a symbol imported through a package's deprecated re-export alias by the name the
package's entry point publishes for the declaration, both in `hostDirectives` and in `ɵmod`.

# /package_alias.ts
```ts
import {Component, NgModule} from '@angular/core';
import {OldDir} from 'mylib';

@Component({selector: 'c', template: '', hostDirectives: [OldDir]})
export class C {}

@NgModule({imports: [OldDir]})
export class M {}
```

ngtsc's `translateTypeReference` re-emits every type reference of an input transform's parameter
type through the reference emitter, so `ngAcceptInputType_*` names each type through a fresh
`import * as iN` of its declaring module, by the name that module exports.

# /api.ts
```ts
export interface Item {
  id: string;
}
```

# /types/item.ts
```ts
export interface Item {
  id: string;
}
```

# /types/typeonly.ts
```ts
export type {Item} from './item';
```

# /foo.ts
```ts
export interface Foo {
  f: number;
}
```

# /util.ts
```ts
import {Foo} from './foo';

export function toNum(v: Foo | string): number {
  return 1;
}
```

# /local_util.ts
```ts
import {Foo} from './imported_transform_local_type';

export function toNum(v: Foo | string): number {
  return 1;
}
```

ngtsc imports a parameter type named through a namespace import afresh.

# /namespace_param.ts
```ts
import {Component, Input} from '@angular/core';
import * as api from './api';

export interface Mapped {
  id: string;
}

export function map(v: api.Item[]): Mapped[] {
  return v;
}

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: map}) items: Mapped[] = [];
}
```

ngtsc imports a type-only import afresh.

# /type_only_import.ts
```ts
import {Component, Input} from '@angular/core';
import type {Item} from './types/item';

export function map(v: Item | null): string[] {
  return [];
}

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: map}) items: string[] = [];
}
```

ngtsc imports a type reached through a type-only re-export from its declaring file.

# /type_only_reexport.ts
```ts
import {Component, Input} from '@angular/core';
import {Item} from './types/typeonly';

export function map(v: Item[]): string[] {
  return [];
}

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: map}) items: string[] = [];
}
```

The same under a local alias, which ngtsc names by its declared name.

# /type_only_reexport_alias.ts
```ts
import {Component, Input} from '@angular/core';
import {Item as It} from './types/typeonly';

export function map(v: It[]): string[] {
  return [];
}

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: map}) items: string[] = [];
}
```

ngtsc re-emits the parameter type of a transform imported from another file from that file, with
its own imports.

# /imported_transform.ts
```ts
import {Component, Input} from '@angular/core';
import {toNum} from './util';

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: toNum}) n = 0;
}
```

ngtsc names a type that such a parameter type names and that is declared in the consumer directly.

# /imported_transform_local_type.ts
```ts
import {Component, Input} from '@angular/core';
import {toNum} from './local_util';

export interface Foo {
  f: number;
}

@Component({selector: 'c', template: ''})
export class C {
  @Input({transform: toNum}) n = 0;
}
```
