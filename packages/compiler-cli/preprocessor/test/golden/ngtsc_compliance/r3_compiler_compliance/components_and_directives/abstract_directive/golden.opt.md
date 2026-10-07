# /out/abstract_directive.ngtypecheck.ts
```ts
/**
 * TCB for /abstract_directive.ts
 * @generated
 */

import * as i0 from './abstract_directive';

/*tcb1*/
function _tcb1(this: i0.AbstractComp) {
  if (true) {
  }
}

```

# /out/abstract_directive.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export abstract class AbstractDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AbstractDir, never> = function AbstractDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AbstractDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AbstractDir,
    '[test-dir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: AbstractDir, selectors: [['', 'test-dir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AbstractDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[test-dir]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export abstract class AbstractInherited extends AbstractDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AbstractInherited, never> = /*@__PURE__*/ ((): any => {
    let ɵAbstractInherited_BaseFactory: any;
    return function AbstractInherited_Factory(__ngFactoryType__: any): any {
      return (
        ɵAbstractInherited_BaseFactory ||
        (ɵAbstractInherited_BaseFactory = i0.ɵɵgetInheritedFactory(AbstractInherited))
      )(__ngFactoryType__ || AbstractInherited);
    };
  })();
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AbstractInherited,
    '[dir2]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AbstractInherited,
    selectors: [['', 'dir2', '']],
    features: [i0.ɵɵInheritDefinitionFeature],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AbstractInherited,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dir2]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export abstract class AbstractComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AbstractComp, never> = function AbstractComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AbstractComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AbstractComp,
    'test-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AbstractComp,
    selectors: [['test-comp']],
    decls: 0,
    vars: 0,
    template: function AbstractComp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AbstractComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-comp',
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
    i0.ɵsetClassDebugInfo(AbstractComp, {
      className: 'AbstractComp',
      filePath: 'abstract_directive.ts',
      lineNumber: 19,
    });
})();

```