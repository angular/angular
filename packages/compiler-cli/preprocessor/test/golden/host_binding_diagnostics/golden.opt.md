# /out/bad-expression.directive.ngtypecheck.ts
```ts
/**
 * TCB for /bad-expression.directive.ts
 * @generated
 */

import * as i0 from './bad-expression.directive';

/*tcb1*/
function _tcb1(this: i0.BadExpressionDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ('button') /*141,149*/;
  }
}

```

# /out/bad-expression.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BadExpressionDirective {
  handle() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BadExpressionDirective, never> =
    function BadExpressionDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || BadExpressionDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BadExpressionDirective,
    '[appBadExpression]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BadExpressionDirective,
    selectors: [['', 'appBadExpression', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BadExpressionDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appBadExpression]',
                standalone: true,
                host: {
                  '[attr.role]': "'button'",
                  '(click)': 'handle((',
                },
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

# /out/dynamic-listener.component.ngtypecheck.ts
```ts
/**
 * TCB for /dynamic-listener.component.ts
 * @generated
 */

import * as i0 from './dynamic-listener.component';

/*tcb1*/
function _tcb1(this: i0.DynamicListenerComponent) {
  if (true) {
  }
}

```

# /out/dynamic-listener.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const HANDLER = () => {};

export class DynamicListenerComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DynamicListenerComponent, never> =
    function DynamicListenerComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DynamicListenerComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DynamicListenerComponent,
    'app-dynamic-listener',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DynamicListenerComponent,
    selectors: [['app-dynamic-listener']],
    decls: 2,
    vars: 0,
    template: function DynamicListenerComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DynamicListenerComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-dynamic-listener',
                standalone: true,
                template: '<div>Hello</div>',
                host: {
                  '(mouseover)': HANDLER,
                },
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
    i0.ɵsetClassDebugInfo(DynamicListenerComponent, {
      className: 'DynamicListenerComponent',
      filePath: 'dynamic-listener.component.ts',
      lineNumber: 13,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/bad-expression.directive.ts",
      "category": "error",
      "code": 5001,
      "messageText": "Parser Error: Unexpected end of expression: handle(( at the end of the expression [handle((] in /bad-expression.directive.ts@0:0\nParser Error: Missing closing parentheses at the end of the expression [handle((] in /bad-expression.directive.ts@0:0\nParser Error: Missing expected ) at the end of the expression [handle((] in /bad-expression.directive.ts@0:0",
      "span": {
        "start": 168,
        "end": 176
      }
    },
    {
      "filePath": "/dynamic-listener.component.ts",
      "category": "error",
      "code": 5001,
      "messageText": "Event binding must be string",
      "span": {
        "start": 180,
        "end": 213
      }
    }
  ]
}

```