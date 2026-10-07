# /out/app.component.ts
```ts
// Of the three imports below, only `./deferred.cmp` may be dropped in favour of a dynamic
// `import()`: it is reached from inside the `@defer` block and nowhere else in this file.
// `./queried.cmp` is also named by `@ViewChild`, and `./twins.cmp` also binds a component the
// template uses eagerly — deferral is all-or-nothing per import statement, as in ngtsc.
import { Component, ViewChild } from '@angular/core';
import { DeferredComponent } from './deferred.cmp';
import { QueriedComponent } from './queried.cmp';
import { DeferredTwin, EagerTwin } from './twins.cmp';
// @ts-ignore
import * as i0 from '@angular/core';

function AppComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'app-deferred')(1, 'app-queried')(2, 'app-deferred-twin');
  }
}
function AppComponent_DeferPlaceholder_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder ');
  }
}

export class AppComponent {
  // A reference the compiler does not remove: the query predicate is emitted into `viewQuery`,
  // so dropping this import would leave a dangling identifier behind. `QueriedComponent` is
  // therefore not deferrable, even though the template reaches it only from the `@defer` block.
  queried?: QueriedComponent;
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
    viewQuery: function AppComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(QueriedComponent, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.queried = _t.first);
      }
    },
    decls: 5,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-eager-twin');
        i0.ɵɵdomTemplate(1, AppComponent_Defer_1_Template, 3, 0)(
          2,
          AppComponent_DeferPlaceholder_2_Template,
          1,
          0,
        );
        i0.ɵɵdefer(3, 1, null, null, 2);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [
      DeferredComponent,
      QueriedComponent,
      DeferredTwin,
      EagerTwin,
    ]),
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
        <app-eager-twin />
        @defer {
          <app-deferred />
          <app-queried />
          <app-deferred-twin />
        } @placeholder {
          Placeholder
        }
      `,
                standalone: true,
                imports: [DeferredComponent, QueriedComponent, DeferredTwin, EagerTwin],
              },
            ],
          },
        ],
        null,
        { queried: [{ type: ViewChild, args: [QueriedComponent] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 25,
    });
})();

```

# /out/deferred.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeferredComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeferredComponent, never> =
    function DeferredComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DeferredComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DeferredComponent,
    'app-deferred',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DeferredComponent,
    selectors: [['app-deferred']],
    decls: 1,
    vars: 0,
    template: function DeferredComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Deferred content');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeferredComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-deferred',
                template: 'Deferred content',
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
    i0.ɵsetClassDebugInfo(DeferredComponent, {
      className: 'DeferredComponent',
      filePath: 'deferred.cmp.ts',
      lineNumber: 8,
    });
})();

```

# /out/queried.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class QueriedComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<QueriedComponent, never> = function QueriedComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || QueriedComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    QueriedComponent,
    'app-queried',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: QueriedComponent,
    selectors: [['app-queried']],
    decls: 1,
    vars: 0,
    template: function QueriedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Queried content');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        QueriedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-queried',
                template: 'Queried content',
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
    i0.ɵsetClassDebugInfo(QueriedComponent, {
      className: 'QueriedComponent',
      filePath: 'queried.cmp.ts',
      lineNumber: 8,
    });
})();

```

# /out/twins.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeferredTwin {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeferredTwin, never> = function DeferredTwin_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DeferredTwin)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DeferredTwin,
    'app-deferred-twin',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DeferredTwin,
    selectors: [['app-deferred-twin']],
    decls: 1,
    vars: 0,
    template: function DeferredTwin_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Deferred twin');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeferredTwin,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-deferred-twin',
                template: 'Deferred twin',
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
    i0.ɵsetClassDebugInfo(DeferredTwin, {
      className: 'DeferredTwin',
      filePath: 'twins.cmp.ts',
      lineNumber: 8,
    });
})();

export class EagerTwin {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerTwin, never> = function EagerTwin_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerTwin)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EagerTwin,
    'app-eager-twin',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EagerTwin,
    selectors: [['app-eager-twin']],
    decls: 1,
    vars: 0,
    template: function EagerTwin_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Eager twin');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerTwin,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-eager-twin',
                template: 'Eager twin',
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
    i0.ɵsetClassDebugInfo(EagerTwin, {
      className: 'EagerTwin',
      filePath: 'twins.cmp.ts',
      lineNumber: 15,
    });
})();

```