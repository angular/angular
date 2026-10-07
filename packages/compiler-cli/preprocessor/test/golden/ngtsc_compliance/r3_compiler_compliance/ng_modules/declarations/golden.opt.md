# /out/declarations.ngtypecheck.ts
```ts
/**
 * TCB for /declarations.ts
 * @generated
 */

import * as i0 from './declarations';

/*tcb1*/
function _tcb1(this: i0.FooComponent) {
  if (true) {
    '' + this.name /*143,147*/ /*143,147*/;
  }
}

```

# /out/declarations.ts
```ts
import { Component, Directive, NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FooComponent {
  name = 'World';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FooComponent, never> = function FooComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FooComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FooComponent,
    'foo',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: FooComponent,
    selectors: [['foo']],
    standalone: false,
    decls: 2,
    vars: 1,
    template: function FooComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1('Hello, ', ctx.name, '!');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'foo',
                template: '<div>Hello, {{name}}!</div>',
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
    i0.ɵsetClassDebugInfo(FooComponent, {
      className: 'FooComponent',
      filePath: 'declarations.ts',
      lineNumber: 7,
    });
})();

export class BarDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BarDirective, never> = function BarDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BarDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BarDirective,
    '[bar]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BarDirective,
    selectors: [['', 'bar', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BarDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[bar]',
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

export class QuxPipe implements PipeTransform {
  transform() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<QuxPipe, never> = function QuxPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || QuxPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<QuxPipe, 'qux', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'qux',
    type: QuxPipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        QuxPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'qux',
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

export class FooModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never> = function FooModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FooModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    FooModule,
    [typeof FooComponent, typeof BarDirective, typeof QuxPipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule, bootstrap: [FooComponent] });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FooModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooModule,
        [
          {
            type: NgModule,
            args: [
              { declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] },
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
    i0.ɵɵsetNgModuleScope(FooModule, { declarations: [FooComponent, BarDirective, QuxPipe] });
})();

```