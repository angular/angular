# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "google3/*": ["*"],
      "charts-alias": ["charts/index"],
      "charts-dir": ["charts/dir"]
    },
    "rootDirs": ["."]
  },
  "angularCompilerOptions": {
    "workspaceName": "google3",
    "_useHostForImportGeneration": true
  },
  "files": [
    "my/upstream/directive.ts",
    "my/upstream/upstream-module.ts",
    "consumer.ts",
    "lib/dir.ts",
    "lib/index.ts",
    "charts/dir.ts",
    "charts/index.ts",
    "api.ts",
    "barrel.ts",
    "paths_alias.ts",
    "namespace_param.ts"
  ]
}
```

# /my/upstream/directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[dirA]',
  standalone: false,
})
class DirectiveA {}

export { DirectiveA as PublicDirectiveA };
```

# /my/upstream/upstream-module.ts
```ts
import { NgModule } from '@angular/core';
import { PublicDirectiveA } from './directive';

@NgModule({
  declarations: [PublicDirectiveA],
  exports: [PublicDirectiveA],
})
export class UpstreamModule {}
```

# /consumer.ts
```ts
import { Component } from '@angular/core';
import { UpstreamModule } from 'google3/my/upstream/upstream-module';

@Component({
  selector: 'consumer-cmp',
  template: '<div dirA></div>',
  imports: [UpstreamModule],
})
export class ConsumerComponent {}
```

With `_useHostForImportGeneration` (Google3's `fileNameToModuleName`, naming modules under the
`google3` workspace, which `paths` maps back to the project), ngtsc imports every reference in an
Ivy static type through the host-generated module name of its declaring file.

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

# /api.ts
```ts
export interface Item {
  id: string;
}
```

# /barrel.ts
```ts
import {NgModule} from '@angular/core';
import {Dir} from './lib/index';

@NgModule({imports: [Dir], exports: [Dir]})
export class M {}
```

Both `paths` aliases lead to `charts/dir.ts`, so ngtsc imports both symbols through one import.

# /paths_alias.ts
```ts
import {NgModule} from '@angular/core';
import {AwesomechartsModule as Ng2AwesomechartsModule} from 'charts-alias';
import {Other} from 'charts-dir';

@NgModule({imports: [Ng2AwesomechartsModule, Other]})
export class M {}
```

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
