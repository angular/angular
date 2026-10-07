# /out/basic_full.ts
```ts
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BasicModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never> = function BasicModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BasicModule)();
  };
  // @ts-ignore
  static ɵmod: BasicModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: BasicModule,
    id: 'BasicModuleId',
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BasicModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BasicModule,
        [{ type: NgModule, args: [{ id: 'BasicModuleId', schemas: [NO_ERRORS_SCHEMA] }] }],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(BasicModule, 'BasicModuleId');

```