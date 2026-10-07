# /out/lifecycle_hooks.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

let events: string[] = [];

export class LifecycleComp {
  nameMin!: string;

  ngOnChanges() {
    events.push('changes' + this.nameMin);
  }

  ngOnInit() {
    events.push('init' + this.nameMin);
  }
  ngDoCheck() {
    events.push('check' + this.nameMin);
  }

  ngAfterContentInit() {
    events.push('content init' + this.nameMin);
  }
  ngAfterContentChecked() {
    events.push('content check' + this.nameMin);
  }

  ngAfterViewInit() {
    events.push('view init' + this.nameMin);
  }
  ngAfterViewChecked() {
    events.push('view check' + this.nameMin);
  }

  ngOnDestroy() {
    events.push(this.nameMin);
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LifecycleComp, never> = function LifecycleComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LifecycleComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LifecycleComp,
    'lifecycle-comp',
    never,
    { 'nameMin': { 'alias': 'name'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LifecycleComp,
    selectors: [['lifecycle-comp']],
    inputs: { nameMin: [0, 'name', 'nameMin'] },
    standalone: false,
    features: [i0.ɵɵNgOnChangesFeature],
    decls: 0,
    vars: 0,
    template: function LifecycleComp_Template(rf: number, ctx: any): any {},
    dependencies: i0.ɵɵgetComponentDepsFactory(LifecycleComp),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LifecycleComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'lifecycle-comp',
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { nameMin: [{ type: Input, args: ['name'] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LifecycleComp, {
      className: 'LifecycleComp',
      filePath: 'lifecycle_hooks.ts',
      lineNumber: 9,
    });
})();

export class SimpleLayout {
  name1 = '1';
  name2 = '2';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SimpleLayout, never> = function SimpleLayout_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SimpleLayout)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SimpleLayout,
    'simple-layout',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleLayout,
    selectors: [['simple-layout']],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [[3, 'name']],
    template: function SimpleLayout_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'lifecycle-comp', 0)(1, 'lifecycle-comp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('name', ctx.name1);
        i0.ɵɵadvance();
        i0.ɵɵproperty('name', ctx.name2);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(SimpleLayout),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SimpleLayout,
        [
          {
            type: Component,
            args: [
              {
                selector: 'simple-layout',
                template: `
        <lifecycle-comp [name]="name1"></lifecycle-comp>
        <lifecycle-comp [name]="name2"></lifecycle-comp>
      `,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(SimpleLayout, {
      className: 'SimpleLayout',
      filePath: 'lifecycle_hooks.ts',
      lineNumber: 50,
    });
})();

export class LifecycleModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LifecycleModule, never> = function LifecycleModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LifecycleModule)();
  };
  // @ts-ignore
  static ɵmod: LifecycleModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LifecycleModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LifecycleModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LifecycleModule,
        [{ type: NgModule, args: [{ declarations: [LifecycleComp, SimpleLayout] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LifecycleModule, { declarations: [LifecycleComp, SimpleLayout] });
})();

```