# /out/src/apps/dashboard.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/apps/dashboard.component.ts
 * @generated
 */

import * as i0 from 'repo/apps/dashboard.component';
import * as i1 from 'repo/widgets/filter_bar.component';
import * as i2 from 'repo/widgets/filter_model';
import * as i3 from 'repo/widgets/filter.directive';
import * as i4 from 'repo/widgets/local_config.component';
import * as i5 from 'repo/widgets/nested_view.component';
import * as i6 from 'repo/widgets/nested/index';

const _ctor1: <T = any, P extends i2.FilterConfig<T> = i2.FilterConfig<T>>(
  init: Pick<i1.FilterBarComponent<T, P>, 'config'>,
) => i1.FilterBarComponent<T, P> = null!;
const _ctor2: <T = any, P extends i2.FilterConfig<T> = i2.FilterConfig<T>>(
  init: Pick<i3.FilterDirective<T, P>, 'filterCfg'>,
) => i3.FilterDirective<T, P> = null!;
const _ctor3: <T extends i4.LocalConfig = i4.LocalConfig>(
  init: Pick<i4.LocalConfigComponent<T>, 'config'>,
) => i4.LocalConfigComponent<T> = null!;
const _ctor4: <T extends i6.NestedData<string> = i6.NestedData<string>>(
  init: Pick<i5.NestedViewComponent<T>, 'viewData'>,
) => i5.NestedViewComponent<T> = null!;

/*tcb1*/
function _tcb1(this: i0.DashboardComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*497,527*/ = _ctor1({
      'config': this.config /*519,525*/ /*519,525*/ /*509,526*/,
    }); /*D:ignore*/
    _t1.config /*510,516*/ = this.config /*519,525*/ /*519,525*/ /*509,526*/;
    var _t2 /*T:DIR:0*/ /*545,571*/ = _ctor2({
      'filterCfg': this.config /*563,569*/ /*563,569*/ /*550,570*/,
    }); /*D:ignore*/
    _t2.filterCfg /*551,560*/ = this.config /*563,569*/ /*563,569*/ /*550,570*/;
    var _t3 /*T:DIR:0*/ /*582,619*/ = _ctor3({
      'config': this.config /*611,617*/ /*611,617*/ /*601,618*/,
    }); /*D:ignore*/
    _t3.config /*602,608*/ = this.config /*611,617*/ /*611,617*/ /*601,618*/;
    var _t4 /*T:DIR:0*/ /*644,677*/ = _ctor4({
      'viewData': this.config /*669,675*/ /*669,675*/ /*657,676*/,
    }); /*D:ignore*/
    _t4.viewData /*658,666*/ = this.config /*669,675*/ /*669,675*/ /*657,676*/;
  }
}

```

# /out/src/apps/dashboard.component.ts
```ts
import { Component } from '@angular/core';
import { FilterBarComponent } from '../widgets/filter_bar.component';
import { FilterDirective } from '../widgets/filter.directive';
import { LocalConfigComponent } from '../widgets/local_config.component';
import { NestedViewComponent } from '../widgets/nested_view.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class DashboardComponent {
  config: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DashboardComponent, never> =
    function DashboardComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DashboardComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DashboardComponent,
    'dashboard-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DashboardComponent,
    selectors: [['dashboard-app']],
    decls: 4,
    vars: 4,
    consts: [
      [3, 'config'],
      [3, 'filterDir'],
      [3, 'viewData'],
    ],
    template: function DashboardComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'filter-bar', 0)(1, 'div', 1)(2, 'local-config-comp', 0)(
          3,
          'nested-view',
          2,
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty('config', ctx.config);
        i0.ɵɵadvance();
        i0.ɵɵproperty('filterDir', ctx.config);
        i0.ɵɵadvance();
        i0.ɵɵproperty('config', ctx.config);
        i0.ɵɵadvance();
        i0.ɵɵproperty('viewData', ctx.config);
      }
    },
    dependencies: [FilterBarComponent, FilterDirective, LocalConfigComponent, NestedViewComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DashboardComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'dashboard-app',
                imports: [
                  FilterBarComponent,
                  FilterDirective,
                  LocalConfigComponent,
                  NestedViewComponent,
                ],
                template: `
        <filter-bar [config]="config"></filter-bar>
        <div [filterDir]="config"></div>
        <local-config-comp [config]="config"></local-config-comp>
        <nested-view [viewData]="config"></nested-view>
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
    i0.ɵsetClassDebugInfo(DashboardComponent, {
      className: 'DashboardComponent',
      filePath: 'src/apps/dashboard.component.ts',
      lineNumber: 23,
    });
})();

```

# /out/src/widgets/filter_bar.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/widgets/filter_bar.component.ts
 * @generated
 */

import * as i0 from 'repo/widgets/filter_model';
import * as i1 from 'repo/widgets/filter_bar.component';

/*tcb1*/
function _tcb1<T, P extends i0.FilterConfig<T> = i0.FilterConfig<T>>(
  this: i1.FilterBarComponent<T, P>,
) {
  if (true) {
  }
}

```

# /out/src/widgets/filter_bar.component.ts
```ts
import { Component, Input } from '@angular/core';
import { FilterConfig } from './filter_model';
// @ts-ignore
import * as i0 from '@angular/core';

export class FilterBarComponent<T, P extends FilterConfig<T> = FilterConfig<T>> {
  config!: P;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FilterBarComponent<any, any>, never> =
    function FilterBarComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FilterBarComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FilterBarComponent<any, any>,
    'filter-bar',
    never,
    { 'config': { 'alias': 'config'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: FilterBarComponent,
    selectors: [['filter-bar']],
    inputs: { config: 'config' },
    decls: 0,
    vars: 0,
    template: function FilterBarComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FilterBarComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'filter-bar',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { config: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(FilterBarComponent, {
      className: 'FilterBarComponent',
      filePath: 'src/widgets/filter_bar.component.ts',
      lineNumber: 9,
    });
})();

```

# /out/src/widgets/filter.directive.ts
```ts
import { Directive, Input } from '@angular/core';
import { FilterConfig } from './filter_model';
// @ts-ignore
import * as i0 from '@angular/core';

export class FilterDirective<T, P extends FilterConfig<T> = FilterConfig<T>> {
  filterCfg!: P;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FilterDirective<any, any>, never> =
    function FilterDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FilterDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FilterDirective<any, any>,
    '[filterDir]',
    never,
    { 'filterCfg': { 'alias': 'filterDir'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FilterDirective,
    selectors: [['', 'filterDir', '']],
    inputs: { filterCfg: [0, 'filterDir', 'filterCfg'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FilterDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[filterDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { filterCfg: [{ type: Input, args: ['filterDir'] }] },
      );
  }
}

```

# /out/src/widgets/local_config.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/widgets/local_config.component.ts
 * @generated
 */

import * as i0 from 'repo/widgets/local_config.component';

/*tcb1*/
function _tcb1<T extends i0.LocalConfig = i0.LocalConfig>(this: i0.LocalConfigComponent<T>) {
  if (true) {
  }
}

```

# /out/src/widgets/local_config.component.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export interface LocalConfig {
  count: number;
}

export class LocalConfigComponent<T extends LocalConfig = LocalConfig> {
  config!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalConfigComponent<any>, never> =
    function LocalConfigComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalConfigComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalConfigComponent<any>,
    'local-config-comp',
    never,
    { 'config': { 'alias': 'config'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalConfigComponent,
    selectors: [['local-config-comp']],
    inputs: { config: 'config' },
    decls: 0,
    vars: 0,
    template: function LocalConfigComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalConfigComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-config-comp',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { config: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LocalConfigComponent, {
      className: 'LocalConfigComponent',
      filePath: 'src/widgets/local_config.component.ts',
      lineNumber: 12,
    });
})();

```

# /out/src/widgets/nested_view.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/widgets/nested_view.component.ts
 * @generated
 */

import * as i0 from 'repo/widgets/nested/index';
import * as i1 from 'repo/widgets/nested_view.component';

/*tcb1*/
function _tcb1<T extends i0.NestedData<string> = i0.NestedData<string>>(
  this: i1.NestedViewComponent<T>,
) {
  if (true) {
  }
}

```

# /out/src/widgets/nested_view.component.ts
```ts
import { Component, Input } from '@angular/core';
import { NestedData } from './nested/index';
// @ts-ignore
import * as i0 from '@angular/core';

export class NestedViewComponent<T extends NestedData<string> = NestedData<string>> {
  viewData!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedViewComponent<any>, never> =
    function NestedViewComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedViewComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NestedViewComponent<any>,
    'nested-view',
    never,
    { 'viewData': { 'alias': 'viewData'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NestedViewComponent,
    selectors: [['nested-view']],
    inputs: { viewData: 'viewData' },
    decls: 0,
    vars: 0,
    template: function NestedViewComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedViewComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'nested-view',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { viewData: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(NestedViewComponent, {
      className: 'NestedViewComponent',
      filePath: 'src/widgets/nested_view.component.ts',
      lineNumber: 9,
    });
})();

```