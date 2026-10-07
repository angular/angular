# /out/aria_properties.ngtypecheck.ts
```ts
/**
 * TCB for /aria_properties.ts
 * @generated
 */

import { Component, Directive } from '@angular/core';

@Directive({ selector: '[myDir]' })
class MyDir {}

@Component({
  template: `
    <input myDir [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label" />
  `,
  imports: [MyDir],
})
export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
}

/*tcb1*/
function _tcb1(this: MyComponent) {
  if (true) {
    this.disabled /*169,177*/ /*169,177*/;
    this.readonly /*196,204*/ /*196,204*/;
    this.label /*219,224*/ /*219,224*/;
  }
}

```

# /out/aria_properties.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class MyDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never> = function MyDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDir,
    '[myDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MyDir, selectors: [['', 'myDir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDir,
        [{ type: Directive, args: [{ selector: '[myDir]' }] }],
        null,
        null,
      );
  }
}

export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    decls: 1,
    vars: 3,
    consts: [['myDir', '', 3, 'aria-readonly', 'ariaLabel']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'input', 0);
      }
      if (rf & 2) {
        i0.ɵɵariaProperty('aria-readonly', ctx.readonly);
        i0.ɵɵproperty('ariaLabel', ctx.label);
        i0.ɵɵattribute('aria-disabled', ctx.disabled);
      }
    },
    dependencies: [MyDir],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <input myDir [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
      `,
                imports: [MyDir],
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'aria_properties.ts',
      lineNumber: 12,
    });
})();

```