# /out/host_binding_pure_functions.ngtypecheck.ts
```ts
/**
 * TCB for /host_binding_pure_functions.ts
 * @generated
 */

import * as i0 from './host_binding_pure_functions';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ({
      'value' /*176,181*/: this
        .getExpandedState /*183,199*/
        () /*183,201*/,
      'params' /*211,217*/: {
        'collapsedHeight' /*231,246*/: this.collapsedHeight /*248,263*/ /*248,263*/,
        'expandedHeight' /*275,289*/: this.expandedHeight /*291,305*/ /*291,305*/,
      } /*219,315*/,
    }) /*166,321*/;
    ({
      'value' /*362,367*/: this
        .getExpandedState /*369,385*/
        () /*369,387*/,
      'params' /*395,401*/: {
        'collapsedWidth' /*413,427*/: this.collapsedWidth /*429,443*/ /*429,443*/,
        'expandedWidth' /*453,466*/: this.expandedWidth /*468,481*/ /*468,481*/,
      } /*403,489*/,
    }) /*354,495*/;
  }
}

```

# /out/host_binding_pure_functions.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any, a1: any): any => ({ collapsedHeight: a0, expandedHeight: a1 });
const _c1 = (a0: any, a1: any): any => ({ value: a0, params: a1 });
const _c2 = (a0: any, a1: any): any => ({ collapsedWidth: a0, expandedWidth: a1 });

export class MyComponent {
  expandedHeight!: string;
  collapsedHeight!: string;

  expandedWidth!: string;
  collapsedWidth!: string;

  getExpandedState() {
    return 'expanded';
  }
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
    {
      'expandedHeight': { 'alias': 'expandedHeight'; 'required': false };
      'collapsedHeight': { 'alias': 'collapsedHeight'; 'required': false };
      'expandedWidth': { 'alias': 'expandedWidth'; 'required': false };
      'collapsedWidth': { 'alias': 'collapsedWidth'; 'required': false };
    },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    hostVars: 14,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵsyntheticHostProperty(
          '@expansionHeight',
          i0.ɵɵpureFunction2(
            5,
            _c1,
            ctx.getExpandedState(),
            i0.ɵɵpureFunction2(2, _c0, ctx.collapsedHeight, ctx.expandedHeight),
          ),
        )(
          '@expansionWidth',
          i0.ɵɵpureFunction2(
            11,
            _c1,
            ctx.getExpandedState(),
            i0.ɵɵpureFunction2(8, _c2, ctx.collapsedWidth, ctx.expandedWidth),
          ),
        );
      }
    },
    inputs: {
      expandedHeight: 'expandedHeight',
      collapsedHeight: 'collapsedHeight',
      expandedWidth: 'expandedWidth',
      collapsedWidth: 'collapsedWidth',
    },
    standalone: false,
    decls: 1,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, '...');
      }
    },
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
                template: '...',
                host: {
                  '[@expansionHeight]': `{
            value: getExpandedState(),
            params: {
              collapsedHeight: collapsedHeight,
              expandedHeight: expandedHeight
            }
        }`,
                  '[@expansionWidth]': `{
          value: getExpandedState(),
          params: {
            collapsedWidth: collapsedWidth,
            expandedWidth: expandedWidth
          }
        }`,
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          expandedHeight: [{ type: Input }],
          collapsedHeight: [{ type: Input }],
          expandedWidth: [{ type: Input }],
          collapsedWidth: [{ type: Input }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'host_binding_pure_functions.ts',
      lineNumber: 24,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```