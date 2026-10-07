# /out/ng_content_selectors_diagnostics.ngtypecheck.ts
```ts
/**
 * TCB for /ng_content_selectors_diagnostics.ts
 * @generated
 */

import * as i0 from './ng_content_selectors_diagnostics';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    if (this.show /*186,190*/ /*186,190*/) {
    }
  }
}

/* Diagnostics:
 - (202, 207) Node matches the "div" slot of the "HasContent" component, but will not be projected into the specific slot because the surrounding @if has more than one node at its root. To project the node in the right slot, you can:

1. Wrap the content of the @if block in an <ng-container/> that matches the "div" selector.
2. Split the content of the @if block across multiple @if blocks such that each one only has a single projectable node at its root.
3. Remove all content from the @if block, except for the node being projected.

This check can be disabled using the `extendedDiagnostics.checks.controlFlowPreventingContentProjection = "suppress"` compiler option.
 - (222, 227) Node matches the "div" slot of the "HasContent" component, but will not be projected into the specific slot because the surrounding @if has more than one node at its root. To project the node in the right slot, you can:

1. Wrap the content of the @if block in an <ng-container/> that matches the "div" selector.
2. Split the content of the @if block across multiple @if blocks such that each one only has a single projectable node at its root.
3. Remove all content from the @if block, except for the node being projected.

This check can be disabled using the `extendedDiagnostics.checks.controlFlowPreventingContentProjection = "suppress"` compiler option.
*/

```

# /out/ng_content_selectors_diagnostics.ts
```ts
import { Component } from '@angular/core';
import { HasContent } from 'test-lib';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'div')(1, 'div');
  }
}

export class MyApp {
  show = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    decls: 2,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'has-content');
        i0.ɵɵconditionalCreate(1, MyApp_Conditional_1_Template, 2, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.show ? 1 : -1);
      }
    },
    dependencies: [HasContent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                imports: [HasContent],
                template: `
        <has-content>
          @if (show) {
            <div></div>
            <div></div>
          }
        </has-content>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'ng_content_selectors_diagnostics.ts',
      lineNumber: 17,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/ng_content_selectors_diagnostics.ts",
      "category": "warning",
      "code": 8011,
      "messageText": "Node matches the \"div\" slot of the \"HasContent\" component, but will not be projected into the specific slot because the surrounding @if has more than one node at its root. To project the node in the right slot, you can:\n\n1. Wrap the content of the @if block in an <ng-container/> that matches the \"div\" selector.\n2. Split the content of the @if block across multiple @if blocks such that each one only has a single projectable node at its root.\n3. Remove all content from the @if block, except for the node being projected.\n\nThis check can be disabled using the `extendedDiagnostics.checks.controlFlowPreventingContentProjection = \"suppress\"` compiler option.",
      "span": {
        "start": 202,
        "end": 207
      }
    },
    {
      "filePath": "/ng_content_selectors_diagnostics.ts",
      "category": "warning",
      "code": 8011,
      "messageText": "Node matches the \"div\" slot of the \"HasContent\" component, but will not be projected into the specific slot because the surrounding @if has more than one node at its root. To project the node in the right slot, you can:\n\n1. Wrap the content of the @if block in an <ng-container/> that matches the \"div\" selector.\n2. Split the content of the @if block across multiple @if blocks such that each one only has a single projectable node at its root.\n3. Remove all content from the @if block, except for the node being projected.\n\nThis check can be disabled using the `extendedDiagnostics.checks.controlFlowPreventingContentProjection = \"suppress\"` compiler option.",
      "span": {
        "start": 222,
        "end": 227
      }
    }
  ]
}

```