# /out/test.ts
```ts
import { Component, NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ImportedStateTextPipe implements PipeTransform {
  transform(state?: number): string {
    return 'imported';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedStateTextPipe, never> =
    function ImportedStateTextPipe_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImportedStateTextPipe)();
    };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<ImportedStateTextPipe, 'stateText', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'stateText',
      type: ImportedStateTextPipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedStateTextPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'stateText',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class ImportedSharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedSharedModule, never> =
    function ImportedSharedModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImportedSharedModule)();
    };
  // @ts-ignore
  static ɵmod: ImportedSharedModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ImportedSharedModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ImportedSharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [ImportedStateTextPipe],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedSharedModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [ImportedStateTextPipe],
                exports: [ImportedStateTextPipe],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ImportedSharedModule, {
      declarations: [ImportedStateTextPipe],
      exports: [ImportedStateTextPipe],
    });
})();

type Status = 'READY' | 'PENDING' | 'ACTION';

export class LocalStateTextPipe implements PipeTransform {
  transform(state: Status): string {
    return 'local';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalStateTextPipe, never> =
    function LocalStateTextPipe_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalStateTextPipe)();
    };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<LocalStateTextPipe, 'stateText', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'stateText',
      type: LocalStateTextPipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalStateTextPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'stateText',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class ReproPipeShadowingComponent {
  status: Status = 'ACTION';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReproPipeShadowingComponent, never> =
    function ReproPipeShadowingComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ReproPipeShadowingComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ReproPipeShadowingComponent,
    'repro-pipe-shadowing',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ReproPipeShadowingComponent,
    selectors: [['repro-pipe-shadowing']],
    standalone: false,
    decls: 3,
    vars: 3,
    template: function ReproPipeShadowingComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'stateText');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx.status));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ReproPipeShadowingComponent),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReproPipeShadowingComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'repro-pipe-shadowing',
                standalone: false,
                template: '<div>{{ status | stateText }}</div>',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ReproPipeShadowingComponent, {
      className: 'ReproPipeShadowingComponent',
      filePath: 'test.ts',
      lineNumber: 36,
    });
})();

export class ReproPipeShadowingModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReproPipeShadowingModule, never> =
    function ReproPipeShadowingModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ReproPipeShadowingModule)();
    };
  // @ts-ignore
  static ɵmod: ReproPipeShadowingModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ReproPipeShadowingModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ReproPipeShadowingModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({
      imports: [ImportedSharedModule, ReproPipeShadowingComponent],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReproPipeShadowingModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [ReproPipeShadowingComponent, LocalStateTextPipe],
                imports: [ImportedSharedModule],
                exports: [ReproPipeShadowingComponent],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ReproPipeShadowingModule, {
      declarations: [ReproPipeShadowingComponent, LocalStateTextPipe],
      imports: [ImportedSharedModule],
      exports: [ReproPipeShadowingComponent],
    });
})();

```