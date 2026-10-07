# /out/extra_root_dir.ngtypecheck.ts
```ts
/**
 * TCB for /extra_root_dir.ts
 * @generated
 */

import * as i0 from './extra_root_dir';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateFile":"/./dir/extra.html"}}*/

```

# /out/extra_root_dir.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function TestCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                standalone: false,
                template: '',
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'extra_root_dir.ts',
      lineNumber: 8,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/extra_root_dir.ts",
      "category": "error",
      "code": 2008,
      "messageText": "Could not find template file './dir/extra.html'.",
      "span": {
        "start": 98,
        "end": 116
      }
    }
  ]
}

```