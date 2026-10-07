# /out/app.component.ts
```ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Sealed, Track } from './decorators';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['el'];
const _c1 = [[['header']]];
const _c2 = ['header'];

@Track('AboveComponent')
export class AboveComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AboveComponent, never> = function AboveComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AboveComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AboveComponent,
    'above-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AboveComponent,
    selectors: [['above-cmp']],
    decls: 2,
    vars: 0,
    template: function AboveComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Above');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AboveComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'above-cmp',
                template: '<div>Above</div>',
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
    i0.ɵsetClassDebugInfo(AboveComponent, {
      className: 'AboveComponent',
      filePath: 'app.component.ts',
      lineNumber: 9,
    });
})();

@Track('BelowComponent')
export class BelowComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BelowComponent, never> = function BelowComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BelowComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BelowComponent,
    'below-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BelowComponent,
    selectors: [['below-cmp']],
    decls: 2,
    vars: 0,
    template: function BelowComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Below');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BelowComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'below-cmp',
                template: '<div>Below</div>',
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
    i0.ɵsetClassDebugInfo(BelowComponent, {
      className: 'BelowComponent',
      filePath: 'app.component.ts',
      lineNumber: 16,
    });
})();

@Sealed
export class BareDecoratorComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BareDecoratorComponent, never> =
    function BareDecoratorComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || BareDecoratorComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BareDecoratorComponent,
    'bare-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BareDecoratorComponent,
    selectors: [['bare-cmp']],
    decls: 2,
    vars: 0,
    template: function BareDecoratorComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Bare');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BareDecoratorComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'bare-cmp',
                template: '<div>Bare</div>',
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
    i0.ɵsetClassDebugInfo(BareDecoratorComponent, {
      className: 'BareDecoratorComponent',
      filePath: 'app.component.ts',
      lineNumber: 23,
    });
})();

@Track('SandwichComponent')
@Sealed
export class SandwichComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SandwichComponent, never> =
    function SandwichComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || SandwichComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SandwichComponent,
    'sandwich-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SandwichComponent,
    selectors: [['sandwich-cmp']],
    decls: 2,
    vars: 0,
    template: function SandwichComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Sandwich');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SandwichComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'sandwich-cmp',
                template: '<div>Sandwich</div>',
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
    i0.ɵsetClassDebugInfo(SandwichComponent, {
      className: 'SandwichComponent',
      filePath: 'app.component.ts',
      lineNumber: 31,
    });
})();

@Track('ConstPoolComponent')
export class ConstPoolComponent {
  el?: ElementRef;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConstPoolComponent, never> =
    function ConstPoolComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ConstPoolComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ConstPoolComponent,
    'const-pool-cmp',
    never,
    {},
    {},
    never,
    ['header'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ConstPoolComponent,
    selectors: [['const-pool-cmp']],
    viewQuery: function ConstPoolComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.el = _t.first);
      }
    },
    ngContentSelectors: _c2,
    decls: 3,
    vars: 0,
    consts: [['el', '']],
    template: function ConstPoolComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c1);
        i0.ɵɵprojection(0);
        i0.ɵɵelement(1, 'div', null, 0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConstPoolComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'const-pool-cmp',
                template: '<ng-content select="header"></ng-content><div #el></div>',
              },
            ],
          },
        ],
        null,
        { el: [{ type: ViewChild, args: ['el'] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ConstPoolComponent, {
      className: 'ConstPoolComponent',
      filePath: 'app.component.ts',
      lineNumber: 38,
    });
})();

export class ConstPoolPlainComponent {
  el?: ElementRef;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConstPoolPlainComponent, never> =
    function ConstPoolPlainComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ConstPoolPlainComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ConstPoolPlainComponent,
    'const-pool-plain-cmp',
    never,
    {},
    {},
    never,
    ['header'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ConstPoolPlainComponent,
    selectors: [['const-pool-plain-cmp']],
    viewQuery: function ConstPoolPlainComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.el = _t.first);
      }
    },
    ngContentSelectors: _c2,
    decls: 3,
    vars: 0,
    consts: [['el', '']],
    template: function ConstPoolPlainComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c1);
        i0.ɵɵprojection(0);
        i0.ɵɵelement(1, 'div', null, 0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConstPoolPlainComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'const-pool-plain-cmp',
                template: '<ng-content select="header"></ng-content><div #el></div>',
              },
            ],
          },
        ],
        null,
        { el: [{ type: ViewChild, args: ['el'] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ConstPoolPlainComponent, {
      className: 'ConstPoolPlainComponent',
      filePath: 'app.component.ts',
      lineNumber: 46,
    });
})();

```