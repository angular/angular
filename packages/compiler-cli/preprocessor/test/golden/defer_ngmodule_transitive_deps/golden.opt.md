# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './pipe';

var _pipe1 = null! as i1.TrimPipe;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    '' + _pipe1.transform(/*327,331*/ ' hello ' /*315,324*/) /*315,331*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { MatButtonModule } from './button_module';
import { TrimPipeModule } from './pipe_module';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './button';
// @ts-ignore
import * as i2 from './pipe';

const AppComponent_Defer_1_DepsFn = (): any => [i1.MatButton, i2.TrimPipe];
function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, 'trim');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ' hello '));
  }
}

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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 3,
    vars: 0,
    consts: [['matButton', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 3, 3);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnImmediate();
      }
    },
    dependencies: [MatButtonModule, TrimPipeModule],
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
                standalone: true,
                imports: [MatButtonModule, TrimPipeModule],
                template: `
        @defer (on immediate) {
          <button matButton>{{ '  hello  ' | trim }}</button>
        }
      `,
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
      filePath: 'app.ts',
      lineNumber: 15,
    });
})();

```

# /out/button_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButton } from './button';
// @ts-ignore
import * as i0 from '@angular/core';

export class MatButtonModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatButtonModule, never> = function MatButtonModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatButtonModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MatButtonModule,
    [typeof MatButton],
    never,
    [typeof MatButton]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MatButtonModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MatButtonModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatButtonModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MatButton],
                exports: [MatButton],
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
    i0.ɵɵsetNgModuleScope(MatButtonModule, { declarations: [MatButton], exports: [MatButton] });
})();

```

# /out/button.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MatButton {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatButton, never> = function MatButton_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatButton)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MatButton,
    '[matButton]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MatButton,
    selectors: [['', 'matButton', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatButton,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[matButton]',
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

```

# /out/pipe_module.ts
```ts
import { NgModule } from '@angular/core';
import { TrimPipe } from './pipe';
// @ts-ignore
import * as i0 from '@angular/core';

export class TrimPipeModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TrimPipeModule, never> = function TrimPipeModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TrimPipeModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TrimPipeModule,
    [typeof TrimPipe],
    never,
    [typeof TrimPipe]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TrimPipeModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TrimPipeModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TrimPipeModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [TrimPipe],
                exports: [TrimPipe],
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
    i0.ɵɵsetNgModuleScope(TrimPipeModule, { declarations: [TrimPipe], exports: [TrimPipe] });
})();

```

# /out/pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TrimPipe implements PipeTransform {
  transform(v: string): string {
    return v.trim();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TrimPipe, never> = function TrimPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TrimPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<TrimPipe, 'trim', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'trim',
    type: TrimPipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TrimPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'trim',
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

```