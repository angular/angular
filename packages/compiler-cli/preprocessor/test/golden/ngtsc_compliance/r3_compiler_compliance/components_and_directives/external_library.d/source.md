# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "paths": {
      "external_library": [
        "./external_library"
      ]
    }
  },
  "files": [
    "external_library.d.ts",
    "library_exports.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /external_library.d.ts
```ts
import * as i0 from '@angular/core';

declare class LibDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<LibDirective, 'lib-dir', never, {}, {}, never>;
}

export declare class LibModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<LibModule, [typeof LibDirective], never, [typeof LibDirective]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<LibModule>;
}

export {LibDirective as ɵangular_packages_forms_forms_a}
export {LibDirective}
export {LibDirective as ɵangular_packages_forms_forms_b}
```

# /library_exports.ts
```ts
// This test verifies that a directive from an external library is emitted using its declared name,
// even in the presence of alias exports that could have been chosen.
// See https://github.com/angular/angular/issues/41277.
import {Component, NgModule} from '@angular/core';
import {LibModule} from 'external_library';

@Component({
    template: `
    <lib-dir></lib-dir>
  `,
    standalone: false
})
export class TestComponent {
}

@NgModule({
  declarations: [TestComponent],
  imports: [LibModule],
})
export class TestModule {
}
```
