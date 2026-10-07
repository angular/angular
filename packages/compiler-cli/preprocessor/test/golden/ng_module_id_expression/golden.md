# /out/id_expression.ts
```ts
import { NgModule } from '@angular/core';

import { ChunkId } from './chunk_ids';
// @ts-ignore
import * as i0 from '@angular/core';

declare const module: { id: string };

const LOCAL_ID = 'local_const_id';

export class EnumIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EnumIdModule, never> = function EnumIdModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EnumIdModule)();
  };
  // @ts-ignore
  static ɵmod: EnumIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: EnumIdModule,
    id: ChunkId.LAZY_THING,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<EnumIdModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EnumIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: ChunkId.LAZY_THING,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(EnumIdModule, ChunkId.LAZY_THING);

export class ConstIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConstIdModule, never> = function ConstIdModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ConstIdModule)();
  };
  // @ts-ignore
  static ɵmod: ConstIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ConstIdModule,
    id: LOCAL_ID,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ConstIdModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConstIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: LOCAL_ID,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(ConstIdModule, LOCAL_ID);

export class LiteralIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LiteralIdModule, never> = function LiteralIdModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LiteralIdModule)();
  };
  // @ts-ignore
  static ɵmod: LiteralIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: LiteralIdModule,
    id: 'literal_id',
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LiteralIdModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LiteralIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: 'literal_id',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(LiteralIdModule, 'literal_id');

export class ModuleIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleIdModule, never> = function ModuleIdModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleIdModule)();
  };
  // @ts-ignore
  static ɵmod: ModuleIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModuleIdModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModuleIdModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: module.id,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class OptionalChainModuleIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OptionalChainModuleIdModule, never> =
    function OptionalChainModuleIdModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || OptionalChainModuleIdModule)();
    };
  // @ts-ignore
  static ɵmod: OptionalChainModuleIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: OptionalChainModuleIdModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<OptionalChainModuleIdModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OptionalChainModuleIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: module?.id,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class ParenthesizedModuleIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParenthesizedModuleIdModule, never> =
    function ParenthesizedModuleIdModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ParenthesizedModuleIdModule)();
    };
  // @ts-ignore
  static ɵmod: ParenthesizedModuleIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ParenthesizedModuleIdModule,
    id: module.id,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ParenthesizedModuleIdModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ParenthesizedModuleIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: module.id,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(ParenthesizedModuleIdModule, module.id);

export class CastModuleIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CastModuleIdModule, never> =
    function CastModuleIdModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || CastModuleIdModule)();
    };
  // @ts-ignore
  static ɵmod: CastModuleIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: CastModuleIdModule,
    id: module.id,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<CastModuleIdModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CastModuleIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: module.id as any,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(CastModuleIdModule, module.id);

export class NonNullModuleIdModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NonNullModuleIdModule, never> =
    function NonNullModuleIdModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NonNullModuleIdModule)();
    };
  // @ts-ignore
  static ɵmod: NonNullModuleIdModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NonNullModuleIdModule,
    id: module.id,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NonNullModuleIdModule> = /*@__PURE__*/ i0.ɵɵdefineInjector(
    {},
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NonNullModuleIdModule,
        [
          {
            type: NgModule,
            args: [
              {
                id: module.id!,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
i0.ɵɵregisterNgModuleType(NonNullModuleIdModule, module.id);

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/id_expression.ts",
      "category": "warning",
      "code": 6100,
      "messageText": "Using 'module.id' for NgModule.id is a common anti-pattern that is ignored by the Angular compiler.",
      "span": {
        "start": 371,
        "end": 380
      }
    },
    {
      "filePath": "/id_expression.ts",
      "category": "warning",
      "code": 6100,
      "messageText": "Using 'module.id' for NgModule.id is a common anti-pattern that is ignored by the Angular compiler.",
      "span": {
        "start": 435,
        "end": 445
      }
    }
  ]
}

```