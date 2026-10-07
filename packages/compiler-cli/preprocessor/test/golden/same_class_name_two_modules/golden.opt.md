# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './widget-a';
import { Widget as WidgetC } from './widget-c';
// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_2_DepsFn = (): any => [
  /* @ts-ignore */
  import('./widget-b').then((m: any): any => m.Widget),
];
function AppComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'widget-b');
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
    decls: 4,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'widget-a');
        i0.ɵɵdomTemplate(1, AppComponent_Defer_1_Template, 1, 0);
        i0.ɵɵdefer(2, 1, AppComponent_Defer_2_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: [Widget],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComponent,
        (): any => [
          /* @ts-ignore */
          import('./widget-b').then((m: any): any => m.Widget),
        ],
        (Widget: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-root',
                    template: `
        <widget-a />

        @defer {
          <widget-b />
        }
      `,
                    imports: [Widget, WidgetB, WidgetC],
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 17,
    });
})();

```

# /out/widget-a.ngtypecheck.ts
```ts
/**
 * TCB for /widget-a.ts
 * @generated
 */

import * as i0 from './widget-a';

/*tcb1*/
function _tcb1(this: i0.Widget) {
  if (true) {
  }
}

```

# /out/widget-a.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Widget {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Widget, never> = function Widget_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Widget)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Widget,
    'widget-a',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Widget,
    selectors: [['widget-a']],
    decls: 1,
    vars: 0,
    template: function Widget_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'A');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Widget,
        [
          {
            type: Component,
            args: [
              {
                selector: 'widget-a',
                template: 'A',
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
    i0.ɵsetClassDebugInfo(Widget, { className: 'Widget', filePath: 'widget-a.ts', lineNumber: 7 });
})();

```

# /out/widget-b.ngtypecheck.ts
```ts
/**
 * TCB for /widget-b.ts
 * @generated
 */

import * as i0 from './widget-b';

/*tcb1*/
function _tcb1(this: i0.Widget) {
  if (true) {
  }
}

```

# /out/widget-b.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Widget {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Widget, never> = function Widget_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Widget)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Widget,
    'widget-b',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Widget,
    selectors: [['widget-b']],
    decls: 1,
    vars: 0,
    template: function Widget_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'B');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Widget,
        [
          {
            type: Component,
            args: [
              {
                selector: 'widget-b',
                template: 'B',
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
    i0.ɵsetClassDebugInfo(Widget, { className: 'Widget', filePath: 'widget-b.ts', lineNumber: 7 });
})();

```

# /out/widget-c.ngtypecheck.ts
```ts
/**
 * TCB for /widget-c.ts
 * @generated
 */

import * as i0 from './widget-c';

/*tcb1*/
function _tcb1(this: i0.Widget) {
  if (true) {
  }
}

```

# /out/widget-c.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Widget {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Widget, never> = function Widget_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Widget)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Widget,
    'widget-c',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Widget,
    selectors: [['widget-c']],
    decls: 1,
    vars: 0,
    template: function Widget_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'C');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Widget,
        [
          {
            type: Component,
            args: [
              {
                selector: 'widget-c',
                template: 'C',
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
    i0.ɵsetClassDebugInfo(Widget, { className: 'Widget', filePath: 'widget-c.ts', lineNumber: 7 });
})();

```