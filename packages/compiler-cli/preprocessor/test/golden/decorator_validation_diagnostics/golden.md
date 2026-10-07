# /out/dynamic-standalone.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

declare function isStandalone(): boolean;

export class DynamicStandaloneDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DynamicStandaloneDirective, never> =
    function DynamicStandaloneDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DynamicStandaloneDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DynamicStandaloneDirective,
    '[appDynamicStandalone]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DynamicStandaloneDirective,
    selectors: [['', 'appDynamicStandalone', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DynamicStandaloneDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appDynamicStandalone]',
                standalone: isStandalone(),
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

# /out/dynamic.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

declare function pipeName(): string;
declare function isPure(): boolean;

export class DynamicPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DynamicPipe, never> = function DynamicPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DynamicPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<DynamicPipe, 'DynamicPipe', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'DynamicPipe', type: DynamicPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DynamicPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: pipeName(),
                pure: isPure(),
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

# /out/shadow-widget.component.ts
```ts
import { Component, ViewEncapsulation } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ShadowWidgetComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ShadowWidgetComponent, never> =
    function ShadowWidgetComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ShadowWidgetComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ShadowWidgetComponent,
    'widget',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ShadowWidgetComponent,
    selectors: [['widget']],
    decls: 2,
    vars: 0,
    template: function ShadowWidgetComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Shadow');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 3,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ShadowWidgetComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'widget',
                standalone: true,
                template: '<div>Shadow</div>',
                encapsulation: ViewEncapsulation.ShadowDom,
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
    i0.ɵsetClassDebugInfo(ShadowWidgetComponent, {
      className: 'ShadowWidgetComponent',
      filePath: 'shadow-widget.component.ts',
      lineNumber: 9,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/dynamic-standalone.directive.ts",
      "category": "error",
      "code": 1010,
      "messageText": "standalone flag must be a boolean",
      "span": {
        "start": 152,
        "end": 166
      }
    },
    {
      "filePath": "/dynamic.pipe.ts",
      "category": "error",
      "code": 1010,
      "messageText": "@Pipe.name must be a string",
      "span": {
        "start": 144,
        "end": 154
      }
    },
    {
      "filePath": "/dynamic.pipe.ts",
      "category": "error",
      "code": 1010,
      "messageText": "@Pipe.pure must be a boolean",
      "span": {
        "start": 164,
        "end": 172
      }
    },
    {
      "filePath": "/shadow-widget.component.ts",
      "category": "error",
      "code": 2009,
      "messageText": "Selector of a component that uses ViewEncapsulation.ShadowDom must contain a hyphen.",
      "span": {
        "start": 88,
        "end": 96
      }
    }
  ]
}

```