# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './generic.component';

const _ctor1: <T = any>(init: Pick<i1.GenericComponent<T>, 'value'>) => i1.GenericComponent<T> =
  null!;
const _ctor2: <T extends object = {}>(
  init: Pick<i1.DefaultGenericComponent<T>, 'value'>,
) => i1.DefaultGenericComponent<T> = null!;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*180,212*/ = _ctor1({
      'value': 'string' /*202,210*/ /*193,211*/,
    }); /*D:ignore*/
    _t1.value /*194,199*/ = 'string' /*202,210*/ /*193,211*/;
    var _t2 /*T:DIR:0*/ /*231,258*/ = _ctor1({ 'value': 123 /*253,256*/ /*244,257*/ }); /*D:ignore*/
    _t2.value /*245,250*/ = 123 /*253,256*/ /*244,257*/;
    var _t3 /*T:DIR:0*/ /*277,315*/ = _ctor2({
      'value': { 'a' /*308,309*/: 1 /*311,312*/ } /*307,313*/ /*298,314*/,
    }); /*D:ignore*/
    _t3.value /*299,304*/ = { 'a' /*308,309*/: 1 /*311,312*/ } /*307,313*/ /*298,314*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { GenericComponent, DefaultGenericComponent } from './generic.component';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({ a: 1 });

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
    vars: 4,
    consts: [[3, 'value']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-generic', 0)(1, 'app-generic', 0)(2, 'app-default-generic', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', 'string');
        i0.ɵɵadvance();
        i0.ɵɵproperty('value', 123);
        i0.ɵɵadvance();
        i0.ɵɵproperty('value', i0.ɵɵpureFunction0(3, _c0));
      }
    },
    dependencies: [GenericComponent, DefaultGenericComponent],
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
                template: `
        <app-generic [value]="'string'"></app-generic>
        <app-generic [value]="123"></app-generic>
        <app-default-generic [value]="{a: 1}"></app-default-generic>
      `,
                standalone: true,
                imports: [GenericComponent, DefaultGenericComponent],
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
      lineNumber: 14,
    });
})();

```

# /out/generic.component.ngtypecheck.ts
```ts
/**
 * TCB for /generic.component.ts
 * @generated
 */

import * as i0 from './generic.component';

/*tcb1*/
function _tcb1<T>(this: i0.GenericComponent<T>) {
  if (true) {
    '' + this.value /*107,112*/ /*107,112*/;
  }
}

/*tcb2*/
function _tcb2<T extends object = {}>(this: i0.DefaultGenericComponent<T>) {
  if (true) {
    '' + this.value /*309,314*/ /*309,314*/;
  }
}

```

# /out/generic.component.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GenericComponent<T> {
  value: T | null = null;
  constructor(public val: T) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GenericComponent<any>, never> =
    function GenericComponent_Factory(__ngFactoryType__: any): any {
      i0.ɵɵinvalidFactory();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    GenericComponent<any>,
    'app-generic',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: GenericComponent,
    selectors: [['app-generic']],
    inputs: { value: 'value' },
    decls: 1,
    vars: 1,
    template: function GenericComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(ctx.value);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GenericComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-generic',
                template: '{{ value }}',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [{ type: undefined }],
        { value: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(GenericComponent, {
      className: 'GenericComponent',
      filePath: 'generic.component.ts',
      lineNumber: 8,
    });
})();

export class DefaultGenericComponent<T extends object = {}> {
  value: T | null = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGenericComponent<any>, never> =
    function DefaultGenericComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DefaultGenericComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DefaultGenericComponent<any>,
    'app-default-generic',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DefaultGenericComponent,
    selectors: [['app-default-generic']],
    inputs: { value: 'value' },
    decls: 1,
    vars: 1,
    template: function DefaultGenericComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(ctx.value);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DefaultGenericComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-default-generic',
                template: '{{ value }}',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { value: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(DefaultGenericComponent, {
      className: 'DefaultGenericComponent',
      filePath: 'generic.component.ts',
      lineNumber: 18,
    });
})();

```