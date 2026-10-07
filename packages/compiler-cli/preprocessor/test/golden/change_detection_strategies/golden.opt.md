# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.OnPushCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.DefaultCmp) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.EagerCmp) {
  if (true) {
  }
}

/*tcb4*/
function _tcb4(this: i0.OmittedCmp) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class OnPushCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OnPushCmp, never> = function OnPushCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OnPushCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OnPushCmp,
    'on-push-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OnPushCmp,
    selectors: [['on-push-cmp']],
    decls: 2,
    vars: 0,
    template: function OnPushCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'On Push Component');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OnPushCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'on-push-cmp',
                template: '<div>On Push Component</div>',
                changeDetection: ChangeDetectionStrategy.OnPush,
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
    i0.ɵsetClassDebugInfo(OnPushCmp, {
      className: 'OnPushCmp',
      filePath: 'app.component.ts',
      lineNumber: 8,
    });
})();

export class DefaultCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DefaultCmp, never> = function DefaultCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DefaultCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DefaultCmp,
    'default-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DefaultCmp,
    selectors: [['default-cmp']],
    decls: 2,
    vars: 0,
    template: function DefaultCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Default Component');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
    changeDetection: 1,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DefaultCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'default-cmp',
                template: '<div>Default Component</div>',
                changeDetection: ChangeDetectionStrategy.Default,
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
    i0.ɵsetClassDebugInfo(DefaultCmp, {
      className: 'DefaultCmp',
      filePath: 'app.component.ts',
      lineNumber: 15,
    });
})();

export class EagerCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerCmp, never> = function EagerCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EagerCmp,
    'eager-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EagerCmp,
    selectors: [['eager-cmp']],
    decls: 2,
    vars: 0,
    template: function EagerCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Eager Component');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
    changeDetection: 1,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'eager-cmp',
                template: '<div>Eager Component</div>',
                changeDetection: ChangeDetectionStrategy.Eager,
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
    i0.ɵsetClassDebugInfo(EagerCmp, {
      className: 'EagerCmp',
      filePath: 'app.component.ts',
      lineNumber: 22,
    });
})();

// No `changeDetection` at all: the field must be omitted, not defaulted to a
// literal. Emitting it here would diverge from ngc for the most common shape.
export class OmittedCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OmittedCmp, never> = function OmittedCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OmittedCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OmittedCmp,
    'omitted-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OmittedCmp,
    selectors: [['omitted-cmp']],
    decls: 2,
    vars: 0,
    template: function OmittedCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Omitted Component');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OmittedCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'omitted-cmp',
                template: '<div>Omitted Component</div>',
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
    i0.ɵsetClassDebugInfo(OmittedCmp, {
      className: 'OmittedCmp',
      filePath: 'app.component.ts',
      lineNumber: 30,
    });
})();

```