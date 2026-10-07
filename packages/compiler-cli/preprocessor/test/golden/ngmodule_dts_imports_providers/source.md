# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "repo/*": ["*"]
    },
    "rootDirs": ["."]
  },
  "angularCompilerOptions": {
    "workspaceName": "repo"
  },
  "files": [
    "src/modules/parent.module.ts",
    "src/components/standalone-btn.component.ts"
  ]
}
```

# /node_modules/mock_snack_bar/package.json
```json
{
  "name": "mock_snack_bar",
  "types": "index.d.ts"
}
```

# /node_modules/mock_snack_bar/index.d.ts
```ts
import * as i0 from '@angular/core';

export declare class MockSnackBarModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<MockSnackBarModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<MockSnackBarModule, never, never, never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<MockSnackBarModule>;
}
```

# /src/components/standalone-btn.component.ts
```ts
import { Component } from '@angular/core';
import { MockSnackBarModule } from 'mock_snack_bar';

@Component({
  selector: 'standalone-btn',
  template: '<button>Click</button>',
  standalone: true,
  imports: [MockSnackBarModule],
})
export class StandaloneBtn {}
```

# /src/modules/parent.module.ts
```ts
import { NgModule } from '@angular/core';
import { StandaloneBtn } from 'repo/src/components/standalone-btn.component';

@NgModule({
  imports: [StandaloneBtn],
  exports: [StandaloneBtn],
})
export class ParentModule {}
```
