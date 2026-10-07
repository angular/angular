# /out/pipe_bindings_slots.ngtypecheck.ts
```ts
/**
 * TCB for /pipe_bindings_slots.ts
 * @generated
 */

import * as i0 from './pipe_bindings_slots';

var _pipe1 = null! as i0.PipePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    ({}) /*236,238*/;
    _pipe1.transform(/*271,275*/ this.fooExp /*262,268*/ /*262,268*/, 2000 /*276,280*/) /*262,280*/;
    _pipe1.transform(
      /*313,317*/ this.myStyleExp /*300,310*/ /*300,310*/,
      1000 /*318,322*/,
    ) /*300,322*/;
    _pipe1.transform(/*355,359*/ this.barExp /*346,352*/ /*346,352*/, 3000 /*360,364*/) /*346,364*/;
    _pipe1.transform(/*397,401*/ this.bazExp /*388,394*/ /*388,394*/, 4000 /*402,406*/) /*388,406*/;
    '' + this.item /*412,416*/ /*412,416*/;
  }
}

```

# /out/pipe_bindings_slots.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({});

export class PipePipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipePipe, never> = function PipePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipePipe, 'pipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipe',
    type: PipePipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipe',
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

export class MyComponent {
  myStyleExp = {};
  fooExp = 'foo';
  barExp = 'bar';
  bazExp = 'baz';
  items = [1, 2, 3];
  item = 1;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 6,
    vars: 24,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵpipe(1, 'pipe');
        i0.ɵɵpipe(2, 'pipe');
        i0.ɵɵpipe(3, 'pipe');
        i0.ɵɵpipe(4, 'pipe');
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵstyleMap(i0.ɵɵpipeBind2(1, 11, ctx.myStyleExp, 1000));
        i0.ɵɵclassMap(i0.ɵɵpureFunction0(23, _c0));
        i0.ɵɵstyleProp('bar', i0.ɵɵpipeBind2(2, 14, ctx.barExp, 3000))(
          'baz',
          i0.ɵɵpipeBind2(3, 17, ctx.bazExp, 4000),
        );
        i0.ɵɵclassProp('foo', i0.ɵɵpipeBind2(4, 20, ctx.fooExp, 2000));
        i0.ɵɵadvance(5);
        i0.ɵɵtextInterpolate1(' ', ctx.item);
      }
    },
    dependencies: [PipePipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: `
        <div [class]="{}"
             [class.foo]="fooExp | pipe:2000"
             [style]="myStyleExp | pipe:1000"
             [style.bar]="barExp | pipe:3000"
             [style.baz]="bazExp | pipe:4000">
             {{ item }}</div>`,
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'pipe_bindings_slots.ts',
      lineNumber: 22,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyComponent, typeof PipePipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, PipePipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, PipePipe] });
})();

```