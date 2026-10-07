# /out/order_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /order_bindings.ts
 * @generated
 */

import * as i0 from './order_bindings';

/*tcb1*/
function _tcb1(this: i0.SomeCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyCmp) {
  if (true) {
    this.foo /*554,557*/ /*554,557*/ /*545,558*/;
    '' + this.foo /*701,704*/ /*701,704*/ /*679,707*/;
    this.foo /*537,540*/ /*537,540*/;
    this.foo /*579,582*/ /*579,582*/;
    this.foo /*604,607*/ /*604,607*/;
    '' + this.foo /*669,672*/ /*669,672*/;
    var _t1 /*471,713*/ = document.createElement('some-elem'); /*471,713*/ /*471,713*/
    _t1.addEventListener(/*504,510*/ 'event1', ($event /*T:EP*/): any => {
      this
        .foo /*513,516*/
        () /*513,518*/;
    }) /*503,519*/;
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.foo /*320,323*/ /*320,323*/;
    this.foo /*339,342*/ /*339,342*/;
    false /*368,373*/;
    true /*399,403*/;
    this.foo /*422,425*/ /*422,425*/;
    this.foo /*444,447*/ /*444,447*/;
    var _t2 = document.createElement('my-cmp'); /*734,739*/
    _t2.addEventListener(/*279,287*/ 'event1', ($event /*T:EP*/): any => {
      this
        .foo /*291,294*/
        () /*291,296*/;
    }) /*279,296*/;
  }
}

```

# /out/order_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SomeCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeCmp, never> = function SomeCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SomeCmp,
    'some-elem',
    never,
    {
      'attr1': { 'alias': 'attr1'; 'required': false };
      'prop1': { 'alias': 'prop1'; 'required': false };
      'attrInterp1': { 'alias': 'attrInterp1'; 'required': false };
      'propInterp1': { 'alias': 'propInterp1'; 'required': false };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeCmp,
    selectors: [['some-elem']],
    inputs: {
      attr1: 'attr1',
      prop1: 'prop1',
      attrInterp1: 'attrInterp1',
      propInterp1: 'propInterp1',
    },
    decls: 0,
    vars: 0,
    template: function SomeCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'some-elem',
                template: ``,
                inputs: ['attr1', 'prop1', 'attrInterp1', 'propInterp1'],
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
    i0.ɵsetClassDebugInfo(SomeCmp, {
      className: 'SomeCmp',
      filePath: 'order_bindings.ts',
      lineNumber: 8,
    });
})();

export class MyCmp {
  foo: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCmp, never> = function MyCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCmp,
    'my-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCmp,
    selectors: [['my-cmp']],
    hostAttrs: ['literal1', 'foo'],
    hostVars: 10,
    hostBindings: function MyCmp_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('event1', function MyCmp_event1_HostBindingHandler(): any {
          return ctx.foo();
        });
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('id', ctx.foo);
        i0.ɵɵattribute('attr1', ctx.foo);
        i0.ɵɵstyleMap(ctx.foo);
        i0.ɵɵclassMap(ctx.foo);
        i0.ɵɵstyleProp('style1', true);
        i0.ɵɵclassProp('class1', false);
      }
    },
    decls: 1,
    vars: 10,
    consts: [['literal1', 'foo', ',', '', ',', '', 1, 'foo', 3, 'event1', 'prop1', 'propInterp1']],
    template: function MyCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'some-elem', 0);
        i0.ɵɵlistener('event1', function MyCmp_Template_some_elem_event1_0_listener(): any {
          return ctx.foo();
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('style1', ctx.foo);
        i0.ɵɵclassProp('class1', ctx.foo);
        i0.ɵɵattribute('attrInterp1', i0.ɵɵinterpolate1('interp ', ctx.foo));
        i0.ɵɵproperty('propInterp1', i0.ɵɵinterpolate1('interp ', ctx.foo))('prop1', ctx.foo);
        i0.ɵɵattribute('attr1', ctx.foo);
      }
    },
    dependencies: [SomeCmp],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-cmp',
                imports: [SomeCmp],
                host: {
                  'literal1': 'foo',
                  '(event1)': 'foo()',
                  '[attr.attr1]': 'foo',
                  '[id]': 'foo',
                  '[class.class1]': 'false',
                  '[style.style1]': 'true',
                  '[class]': 'foo',
                  '[style]': 'foo',
                },
                template: `
    		<some-elem
    			literal1="foo"
    			(event1)="foo()"
    			[attr.attr1]="foo"
    			[prop1]="foo",
    			[class.class1]="foo",
    			[style.style1]="foo"
    			style="foo"
    			class="foo"
    			attr.attrInterp1="interp {{foo}}"
    			propInterp1="interp {{foo}}"
    			/>
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
    i0.ɵsetClassDebugInfo(MyCmp, {
      className: 'MyCmp',
      filePath: 'order_bindings.ts',
      lineNumber: 38,
    });
})();

```