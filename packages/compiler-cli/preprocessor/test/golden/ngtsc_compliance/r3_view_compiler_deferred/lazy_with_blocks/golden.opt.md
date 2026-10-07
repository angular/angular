# /out/lazy_with_blocks.ngtypecheck.ts
```ts
/**
 * TCB for /lazy_with_blocks.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  selector: 'my-lazy-cmp',
  template: 'Hi!',
})
class MyLazyCmp {}

/*tcb1*/
function _tcb1(this: MyLazyCmp) {
  if (true) {
  }
}

@Component({
  selector: 'app',
  imports: [MyLazyCmp],
  template: `
    Visible: {{ isVisible }}.

    @defer (when isVisible) {
      <my-lazy-cmp />
    } @loading {
      Loading...
    } @placeholder {
      Placeholder!
    } @error {
      Failed to load dependencies :(
    }
  `,
})
class SimpleComponent {
  isVisible = false;

  ngOnInit() {
    setTimeout(() => {
      // This changes the triggering condition of the defer block,
      // but it should be ignored and the placeholder content should be visible.
      this.isVisible = true;
    });
  }
}

/*tcb2*/
function _tcb2(this: SimpleComponent) {
  if (true) {
    '' + this.isVisible /*208,217*/ /*208,217*/;
    if (this.isVisible /*240,249*/ /*240,249*/) {
    }
  }
}

```

# /out/lazy_with_blocks.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const SimpleComponent_Defer_5_DepsFn = (): any => [MyLazyCmp];
function SimpleComponent_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'my-lazy-cmp');
  }
}
function SimpleComponent_DeferLoading_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Loading... ');
  }
}
function SimpleComponent_DeferPlaceholder_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Placeholder! ');
  }
}
function SimpleComponent_DeferError_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Failed to load dependencies :( ');
  }
}

class MyLazyCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyLazyCmp, never> = function MyLazyCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyLazyCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyLazyCmp,
    'my-lazy-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyLazyCmp,
    selectors: [['my-lazy-cmp']],
    decls: 1,
    vars: 0,
    template: function MyLazyCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Hi!');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyLazyCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-lazy-cmp',
                template: 'Hi!',
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
    i0.ɵsetClassDebugInfo(MyLazyCmp, {
      className: 'MyLazyCmp',
      filePath: 'lazy_with_blocks.ts',
      lineNumber: 8,
    });
})();

class SimpleComponent {
  isVisible = false;

  ngOnInit() {
    setTimeout(() => {
      // This changes the triggering condition of the defer block,
      // but it should be ignored and the placeholder content should be visible.
      this.isVisible = true;
    });
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never> = function SimpleComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SimpleComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SimpleComponent,
    'app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [['app']],
    decls: 7,
    vars: 2,
    template: function SimpleComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, SimpleComponent_Defer_1_Template, 1, 0)(
          2,
          SimpleComponent_DeferLoading_2_Template,
          1,
          0,
        )(3, SimpleComponent_DeferPlaceholder_3_Template, 1, 0)(
          4,
          SimpleComponent_DeferError_4_Template,
          1,
          0,
        );
        i0.ɵɵdefer(5, 1, SimpleComponent_Defer_5_DepsFn, 2, 3, 4);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' Visible: ', ctx.isVisible, '. ');
        i0.ɵɵadvance(5);
        i0.ɵɵdeferWhen(ctx.isVisible);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SimpleComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app',
                imports: [MyLazyCmp],
                template: `
    		Visible: {{ isVisible }}.

    		@defer (when isVisible) {
    			<my-lazy-cmp />
    		} @loading {
    			Loading...
    		} @placeholder {
    			Placeholder!
    		} @error {
    			Failed to load dependencies :(
    		}
    	`,
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
    i0.ɵsetClassDebugInfo(SimpleComponent, {
      className: 'SimpleComponent',
      filePath: 'lazy_with_blocks.ts',
      lineNumber: 28,
    });
})();

```