# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './list.component';
import * as i2 from './models';
import * as i3 from './local-list.component';
import * as i4 from './generic-dir.directive';
import * as i5 from './dts-list';

const _ctor1: <T extends i2.SelectionModel<unknown> = i2.SelectionModel<i2.DefaultItem>>(
  init: Pick<i1.MatSelectionList<T>, 'value'>,
) => i1.MatSelectionList<T> = null!;
const _ctor2: <T extends i3.LocalModel = i3.LocalModel>(
  init: Pick<i3.MatLocalList<T>, 'value'>,
) => i3.MatLocalList<T> = null!;
const _ctor3: <T extends i2.SelectionModel<U> = any, U extends i2.DefaultItem = i2.DefaultItem>(
  init: Pick<i4.GenericDir<T, U>, 'data'>,
) => i4.GenericDir<T, U> = null!;
const _ctor4: <T extends i2.SelectionModel<unknown> = i2.SelectionModel<i2.DefaultItem>>(
  init: Pick<i5.MatDtsList<T>, 'value'>,
) => i5.MatDtsList<T> = null!;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*371,411*/ = _ctor1({
      'value': this.selection /*400,409*/ /*400,409*/ /*391,410*/,
    }); /*D:ignore*/
    _t1.value /*392,397*/ = this.selection /*400,409*/ /*400,409*/ /*391,410*/;
    var _t2 /*T:DIR:0*/ /*437,473*/ = _ctor2({
      'value': this.selection /*462,471*/ /*462,471*/ /*453,472*/,
    }); /*D:ignore*/
    _t2.value /*454,459*/ = this.selection /*462,471*/ /*462,471*/ /*453,472*/;
    var _t3 /*T:DIR:0*/ /*495,525*/ = _ctor3({
      'data': this.selection /*514,523*/ /*514,523*/ /*500,524*/,
    }); /*D:ignore*/
    _t3.data /*501,511*/ = this.selection /*514,523*/ /*514,523*/ /*500,524*/;
    var _t4 /*T:DIR:0*/ /*536,570*/ = _ctor4({
      'value': this.selection /*559,568*/ /*559,568*/ /*550,569*/,
    }); /*D:ignore*/
    _t4.value /*551,556*/ = this.selection /*559,568*/ /*559,568*/ /*550,569*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { MatSelectionList } from './list.component';
import { MatLocalList } from './local-list.component';
import { GenericDir } from './generic-dir.directive';
import { MatDtsList } from './dts-list';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  selection: any;
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
    decls: 4,
    vars: 4,
    consts: [
      [3, 'value'],
      [3, 'genericDir'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'mat-selection-list', 0)(1, 'mat-local-list', 0)(2, 'div', 1)(
          3,
          'mat-dts-list',
          0,
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('value', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('genericDir', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('value', ctx.selection);
      }
    },
    dependencies: [MatSelectionList, MatLocalList, GenericDir, MatDtsList],
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
                imports: [MatSelectionList, MatLocalList, GenericDir, MatDtsList],
                template: `
        <mat-selection-list [value]="selection"></mat-selection-list>
        <mat-local-list [value]="selection"></mat-local-list>
        <div [genericDir]="selection"></div>
        <mat-dts-list [value]="selection"></mat-dts-list>
      `,
                standalone: true,
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
      lineNumber: 18,
    });
})();

```

# /out/dts-list.d.ngtypecheck.ts
```ts
/**
 * TCB for /dts-list.d.ts
 * @generated
 */

import * as i0 from './models';
import * as i1 from './dts-list';

/*tcb1*/
function _tcb1<T extends i0.SelectionModel<unknown> = i0.SelectionModel<i0.DefaultItem>>(
  this: i1.MatDtsList<T>,
) {
  if (true) {
  }
}

```

# /out/dts-list.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './models';

export declare class MatDtsList<
  T extends i1.SelectionModel<unknown> = i1.SelectionModel<i1.DefaultItem>,
> {
  value: T;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatDtsList<any>,
    'mat-dts-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  >;
  static ɵfac: i0.ɵɵFactoryDeclaration<MatDtsList<any>, never>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatDtsList<any>, never> = function MatDtsList_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatDtsList)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatDtsList<any>,
    'mat-dts-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MatDtsList,
    selectors: [['mat-dts-list']],
    inputs: { value: 'value' },
    decls: 0,
    vars: 0,
    template: function MatDtsList_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MatDtsList, [{ type: Component }], null, null);
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MatDtsList, {
      className: 'MatDtsList',
      filePath: 'dts-list.d.ts',
      lineNumber: 4,
    });
})();

```

# /out/generic-dir.directive.ts
```ts
import { Directive, Input } from '@angular/core';
import { SelectionModel as CustomModel, DefaultItem } from './models';
// @ts-ignore
import * as i0 from '@angular/core';

export class GenericDir<T extends CustomModel<U>, U extends DefaultItem = DefaultItem> {
  data!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GenericDir<any, any>, never> = function GenericDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || GenericDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    GenericDir<any, any>,
    '[genericDir]',
    never,
    { 'data': { 'alias': 'genericDir'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: GenericDir,
    selectors: [['', 'genericDir', '']],
    inputs: { data: [0, 'genericDir', 'data'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GenericDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[genericDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { data: [{ type: Input, args: ['genericDir'] }] },
      );
  }
}

```

# /out/list.component.ngtypecheck.ts
```ts
/**
 * TCB for /list.component.ts
 * @generated
 */

import * as i0 from './models';
import * as i1 from './list.component';

/*tcb1*/
function _tcb1<T extends i0.SelectionModel<unknown> = i0.SelectionModel<i0.DefaultItem>>(
  this: i1.MatSelectionList<T>,
) {
  if (true) {
  }
}

```

# /out/list.component.ts
```ts
import { Component, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';
// @ts-ignore
import * as i0 from '@angular/core';

export class MatSelectionList<T extends SelectionModel<unknown> = SelectionModel<DefaultItem>> {
  value!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatSelectionList<any>, never> =
    function MatSelectionList_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MatSelectionList)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatSelectionList<any>,
    'mat-selection-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MatSelectionList,
    selectors: [['mat-selection-list']],
    inputs: { value: 'value' },
    decls: 0,
    vars: 0,
    template: function MatSelectionList_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatSelectionList,
        [
          {
            type: Component,
            args: [
              {
                selector: 'mat-selection-list',
                template: '',
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
    i0.ɵsetClassDebugInfo(MatSelectionList, {
      className: 'MatSelectionList',
      filePath: 'list.component.ts',
      lineNumber: 9,
    });
})();

```

# /out/local-list.component.ngtypecheck.ts
```ts
/**
 * TCB for /local-list.component.ts
 * @generated
 */

import * as i0 from './local-list.component';

/*tcb1*/
function _tcb1<T extends i0.LocalModel = i0.LocalModel>(this: i0.MatLocalList<T>) {
  if (true) {
  }
}

```

# /out/local-list.component.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export interface LocalModel {
  name: string;
}

export class MatLocalList<T extends LocalModel = LocalModel> {
  value!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatLocalList<any>, never> = function MatLocalList_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatLocalList)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatLocalList<any>,
    'mat-local-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MatLocalList,
    selectors: [['mat-local-list']],
    inputs: { value: 'value' },
    decls: 0,
    vars: 0,
    template: function MatLocalList_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatLocalList,
        [
          {
            type: Component,
            args: [
              {
                selector: 'mat-local-list',
                template: '',
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
    i0.ɵsetClassDebugInfo(MatLocalList, {
      className: 'MatLocalList',
      filePath: 'local-list.component.ts',
      lineNumber: 12,
    });
})();

```