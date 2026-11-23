# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "emitDeclarationOnly": true,
    "isolatedDeclarations": true
  },
  "angularCompilerOptions": {
    "_experimentalAllowEmitDeclarationOnly": true,
    "onlyPublishPublicTypingsForNgModules": true
  },
  "files": ["permissions_checker.ts"]
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
