# /out/cmp.ts
```ts
import { Component } from '@angular/core';
import { formTypes } from './ns';
import B = formTypes.LabelStyleEnum;
import { c } from './ns';
import req = require('./x');
export import LabelStyleEnum = formTypes.LabelStyleEnum;
// @ts-ignore
import * as i0 from '@angular/core';

const k = 1;

export class AppCmp {
  values = [k, B.A, c, req.x];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppCmp, never> = function AppCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppCmp,
    'app-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppCmp,
      selectors: [['app-cmp']],
      decls: 0,
      vars: 0,
      template: function AppCmp_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppCmp,
        [{ type: Component, args: [{ selector: 'app-cmp', template: '' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppCmp, { className: 'AppCmp', filePath: 'cmp.ts', lineNumber: 10 });
})();

```

# /out/jit.ts
```ts
import { Component } from '@angular/core';
import { formTypes } from './ns';
// @ts-ignore
import * as i0 from '@angular/core';

export const k = 1;
import { c } from './ns';

@Component({ selector: 'jit-cmp', template: '', jit: true })
export class JitCmp {
  value = c;
}

export import JitLabel = formTypes.LabelStyleEnum;

```