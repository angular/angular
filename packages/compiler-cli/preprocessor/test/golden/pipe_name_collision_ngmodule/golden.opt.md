# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './shared.module';

var _pipe1 = null! as i1.SharedTranslatePipe;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    '' + _pipe1.transform(/*168,177*/ 'hello' /*158,165*/) /*158,177*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { LocalModule } from './local.module';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './shared.module';

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    standalone: false,
    decls: 3,
    vars: 3,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'translate');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'hello'));
      }
    },
    dependencies: (): any => [i1.SharedTranslatePipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: `<div>{{ 'hello' | translate }}</div>`,
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 9,
    });
})();

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof AppComponent],
    [typeof LocalModule],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [LocalModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [LocalModule],
                declarations: [AppComponent],
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
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [AppComponent], imports: [LocalModule] });
})();

```

# /out/local.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { SharedModule } from './shared.module';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return `[Local] ${value}`;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalTranslatePipe, never> =
    function LocalTranslatePipe_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalTranslatePipe)();
    };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<LocalTranslatePipe, 'translate', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'translate',
      type: LocalTranslatePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalTranslatePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'translate',
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

export class LocalModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalModule, never> = function LocalModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    LocalModule,
    [typeof LocalTranslatePipe],
    [typeof SharedModule],
    [typeof LocalTranslatePipe, typeof SharedModule]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LocalModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LocalModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule],
                declarations: [LocalTranslatePipe],
                exports: [LocalTranslatePipe, SharedModule], // Export both to create a collision in importers
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
    i0.ɵɵsetNgModuleScope(LocalModule, {
      declarations: [LocalTranslatePipe],
      imports: [SharedModule],
      exports: [LocalTranslatePipe, SharedModule],
    });
})();

```

# /out/shared.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return `[Shared] ${value}`;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedTranslatePipe, never> =
    function SharedTranslatePipe_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || SharedTranslatePipe)();
    };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<SharedTranslatePipe, 'translate', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'translate',
      type: SharedTranslatePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedTranslatePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'translate',
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

export class SharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    SharedModule,
    [typeof SharedTranslatePipe],
    never,
    [typeof SharedTranslatePipe]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [SharedTranslatePipe],
                exports: [SharedTranslatePipe],
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
    i0.ɵɵsetNgModuleScope(SharedModule, {
      declarations: [SharedTranslatePipe],
      exports: [SharedTranslatePipe],
    });
})();

```