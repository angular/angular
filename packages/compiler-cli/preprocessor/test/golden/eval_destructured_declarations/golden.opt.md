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

/*tcb2*/
function _tcb2(this: i0.InnerComponent) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const CONFIG = {
  selector: 'app-root',
  meta: { names: ['inner-cmp', 'other-cmp'] },
};
const LOCAL = { tag: 'local-cmp', aliases: ['first-alias', 'second-alias'] };

// Object destructuring: shorthand, aliased, nested, and a defaulted (but present) property.
const {
  selector,
  meta: {
    names: [innerSelector, otherSelector],
  },
} = CONFIG;
const { tag: localSelector, aliases: [primaryAlias] = [] } = LOCAL;

// Array destructuring, including an elided hole.
const [, secondAlias] = LOCAL.aliases;

// ngtsc does not special-case rest bindings: an object rest is keyed by its own name and an
// array rest by its position, so these resolve to `REST_SRC.rest` and `ARR_SRC[1]` rather
// than to the collected remainder. Locked here so the quirk is not "fixed" into a divergence.
const REST_SRC: any = { used: 'ignored', rest: 'obj-rest-cmp' };
const { used, ...rest } = REST_SRC;

const ARR_SRC: any = ['arr-head', 'arr-rest-cmp'];
const [arrHead, ...arrRest] = ARR_SRC;

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
    decls: 2,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'h1');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [{ type: Component, args: [{ selector, template: '<h1>Hello</h1>' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 26,
    });
})();

export class InnerComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InnerComponent, never> = function InnerComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InnerComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    InnerComponent,
    'inner-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InnerComponent,
    selectors: [['inner-cmp']],
    decls: 1,
    vars: 0,
    template: function InnerComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'inner');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InnerComponent,
        [{ type: Component, args: [{ selector: innerSelector, template: 'inner' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(InnerComponent, {
      className: 'InnerComponent',
      filePath: 'app.component.ts',
      lineNumber: 29,
    });
})();

export class OtherDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherDirective, never> = function OtherDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    OtherDirective,
    '[other-cmp][first-alias]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: OtherDirective,
    selectors: [['', 'other-cmp', '', 'first-alias', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OtherDirective,
        [{ type: Directive, args: [{ selector: `[${otherSelector}][${primaryAlias}]` }] }],
        null,
        null,
      );
  }
}

export class LocalDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDirective, never> = function LocalDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LocalDirective,
    '[local-cmp][second-alias]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LocalDirective,
    selectors: [['', 'local-cmp', '', 'second-alias', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDirective,
        [{ type: Directive, args: [{ selector: `[${localSelector}][${secondAlias}]` }] }],
        null,
        null,
      );
  }
}

export class ObjectRestDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ObjectRestDirective, never> =
    function ObjectRestDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ObjectRestDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ObjectRestDirective,
    '[obj-rest-cmp]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ObjectRestDirective,
    selectors: [['', 'obj-rest-cmp', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ObjectRestDirective,
        [{ type: Directive, args: [{ selector: `[${rest}]` }] }],
        null,
        null,
      );
  }
}

export class ArrayRestDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ArrayRestDirective, never> =
    function ArrayRestDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ArrayRestDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ArrayRestDirective,
    '[arr-rest-cmp]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ArrayRestDirective,
    selectors: [['', 'arr-rest-cmp', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ArrayRestDirective,
        [{ type: Directive, args: [{ selector: `[${arrRest}]` }] }],
        null,
        null,
      );
  }
}

```