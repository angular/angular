# /out/a.ts
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
        i0.ɵɵtext(0, 'Widget A');
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
                template: 'Widget A',
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
    i0.ɵsetClassDebugInfo(Widget, { className: 'Widget', filePath: 'a.ts', lineNumber: 8 });
})();

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './a';

// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_DeferFn = (): any => [
  /* @ts-ignore */
  import('./b').then((m: any): any => m.Widget),
];
function AppComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'widget-b');
  }
}
function AppComponent_DeferPlaceholder_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder ');
  }
}

// An eager `Widget` from `./a` alongside a distinct deferred `Widget` from `./b` (array form).
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
    decls: 5,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'widget-a');
        i0.ɵɵdomTemplate(1, AppComponent_Defer_1_Template, 1, 0)(
          2,
          AppComponent_DeferPlaceholder_2_Template,
          1,
          0,
        );
        i0.ɵɵdefer(3, 1, AppComponent_DeferFn, null, 2);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [Widget]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComponent,
        (): any => [
          /* @ts-ignore */
          import('./b').then((m: any): any => m.Widget),
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
        <widget-a/>
        @defer {
          <widget-b/>
        } @placeholder {
          Placeholder
        }
      `,
                    standalone: true,
                    imports: [Widget],
                    deferredImports: [WidgetB],
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
      lineNumber: 20,
    });
})();

```

# /out/b.ts
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
        i0.ɵɵtext(0, 'Widget B');
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
                template: 'Widget B',
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
    i0.ɵsetClassDebugInfo(Widget, { className: 'Widget', filePath: 'b.ts', lineNumber: 8 });
})();

```

# /out/named.component.ts
```ts
import { Component } from '@angular/core';
import { Widget } from './a';

// @ts-ignore
import * as i0 from '@angular/core';

const MixedComponent_Defer_3_DepsFn = (): any => [
  /* @ts-ignore */
  import('./b').then((m: any): any => m.Widget),
];
function MixedComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'widget-b');
  }
}
function MixedComponent_DeferPlaceholder_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder ');
  }
}

// The same pairing through a named block.
export class MixedComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MixedComponent, never> = function MixedComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MixedComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MixedComponent,
    'app-mixed',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MixedComponent,
    selectors: [['app-mixed']],
    decls: 5,
    vars: 0,
    template: function MixedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'widget-a');
        i0.ɵɵdomTemplate(1, MixedComponent_Defer_1_Template, 1, 0)(
          2,
          MixedComponent_DeferPlaceholder_2_Template,
          1,
          0,
        );
        i0.ɵɵdefer(3, 1, MixedComponent_Defer_3_DepsFn, null, 2);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MixedComponent, [Widget]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        MixedComponent,
        (): any => [
          /* @ts-ignore */
          import('./b').then((m: any): any => m.Widget),
        ],
        (Widget: any): any => {
          i0.ɵsetClassMetadata(
            MixedComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-mixed',
                    template: `
        <widget-a/>
        @defer (name lazy) {
          <widget-b/>
        } @placeholder {
          Placeholder
        }
      `,
                    standalone: true,
                    imports: [Widget],
                    deferredImports: {
                      lazy: [WidgetB],
                    },
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
    i0.ɵsetClassDebugInfo(MixedComponent, {
      className: 'MixedComponent',
      filePath: 'named.component.ts',
      lineNumber: 22,
    });
})();

```

# /out/split.component.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const SplitComponent_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./a').then((m: any): any => m.Widget),
];
const SplitComponent_Defer_4_DepsFn = (): any => [
  /* @ts-ignore */
  import('./b').then((m: any): any => m.Widget),
];
function SplitComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'widget-a');
  }
}
function SplitComponent_Defer_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'widget-b');
  }
}

// Two distinct deferred `Widget`s, each loaded by its own named block.
export class SplitComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SplitComponent, never> = function SplitComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SplitComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SplitComponent,
    'app-split',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SplitComponent,
    selectors: [['app-split']],
    decls: 6,
    vars: 0,
    template: function SplitComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, SplitComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, SplitComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, SplitComponent_Defer_3_Template, 1, 0);
        i0.ɵɵdefer(4, 3, SplitComponent_Defer_4_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        SplitComponent,
        (): any => [
          /* @ts-ignore */
          import('./b').then((m: any): any => m.Widget),
        ],
        (Widget: any): any => {
          i0.ɵsetClassMetadata(
            SplitComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-split',
                    template: `
        @defer (name first) {
          <widget-a/>
        }
        @defer (name second) {
          <widget-b/>
        }
      `,
                    standalone: true,
                    deferredImports: {
                      first: [Widget],
                      second: [WidgetB],
                    },
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
    i0.ɵsetClassDebugInfo(SplitComponent, {
      className: 'SplitComponent',
      filePath: 'split.component.ts',
      lineNumber: 22,
    });
})();

```