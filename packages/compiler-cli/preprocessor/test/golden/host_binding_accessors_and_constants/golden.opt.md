# /out/host.ngtypecheck.ts
```ts
/**
 * TCB for /host.ts
 * @generated
 */

import * as i0 from './host';

/*tcb1*/
function _tcb1(this: i0.MyComp) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.isReady /*367,380*/ /*367,380*/;
  }
}

```

# /out/host.ts
```ts
import { Component, HostBinding } from '@angular/core';
import { IMPORTED_CLASS } from './consts';
// @ts-ignore
import * as i0 from '@angular/core';

const ACTIVE_CLASS = 'is-active';
const ROLE_ATTR = 'attr.role';

export class MyComp {
  private _ready = false;

  // TypeScript only allows decorating the first accessor of a pair, often the setter.
  set isReady(v: boolean) {
    this._ready = v;
  }
  get isReady(): boolean {
    return this._ready;
  }

  // A template literal with substitutions folds to `class.is-active`.
  active = true;

  // A constant folds to `attr.role`.
  role = 'button';

  // An imported constant resolves in optimized (whole-program) mode. The unoptimized mode is
  // single-file, so it cannot follow the import and drops the binding without a diagnostic.
  imported = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never> = function MyComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComp,
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [['my-comp']],
    hostVars: 7,
    hostBindings: function MyComp_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('role', ctx.role);
        i0.ɵɵclassProp('ready', ctx.isReady)('is-active', ctx.active)('from-import', ctx.imported);
      }
    },
    decls: 0,
    vars: 0,
    template: function MyComp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComp,
        [{ type: Component, args: [{ selector: 'my-comp', template: '' }] }],
        null,
        {
          isReady: [{ type: HostBinding, args: ['class.ready'] }],
          active: [{ type: HostBinding, args: [`class.${ACTIVE_CLASS}`] }],
          role: [{ type: HostBinding, args: [ROLE_ATTR] }],
          imported: [{ type: HostBinding, args: [`class.${IMPORTED_CLASS}`] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComp, { className: 'MyComp', filePath: 'host.ts', lineNumber: 8 });
})();

```