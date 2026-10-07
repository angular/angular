# /out/multiple_directives.ngtypecheck.ts
```ts
/**
 * TCB for /multiple_directives.ts
 * @generated
 */

import * as i0 from './multiple_directives';

/*tcb1*/
function _tcb1(this: i0.ClassDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myClassMap /*189,196*/ /*189,196*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.WidthDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myWidth /*340,353*/ /*340,353*/;
    this.myFooClass /*386,397*/ /*386,397*/;
  }
}

/*tcb3*/
function _tcb3(this: i0.HeightDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myHeight /*536,550*/ /*536,550*/;
    this.myBarClass /*584,595*/ /*584,595*/;
  }
}

/*tcb4*/
function _tcb4(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/multiple_directives.ts
```ts
import { Component, Directive, HostBinding, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ClassDirective {
  myClassMap = { red: true };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ClassDirective, never> = function ClassDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ClassDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ClassDirective,
    '[myClassDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ClassDirective,
    selectors: [['', 'myClassDir', '']],
    hostVars: 2,
    hostBindings: function ClassDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵclassMap(ctx.myClassMap);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ClassDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myClassDir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { myClassMap: [{ type: HostBinding, args: ['class'] }] },
      );
  }
}

export class WidthDirective {
  myWidth = 200;

  myFooClass = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WidthDirective, never> = function WidthDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WidthDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    WidthDirective,
    '[myWidthDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WidthDirective,
    selectors: [['', 'myWidthDir', '']],
    hostVars: 4,
    hostBindings: function WidthDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('width', ctx.myWidth);
        i0.ɵɵclassProp('foo', ctx.myFooClass);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WidthDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myWidthDir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myWidth: [{ type: HostBinding, args: ['style.width'] }],
          myFooClass: [{ type: HostBinding, args: ['class.foo'] }],
        },
      );
  }
}

export class HeightDirective {
  myHeight = 200;

  myBarClass = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HeightDirective, never> = function HeightDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HeightDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HeightDirective,
    '[myHeightDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HeightDirective,
    selectors: [['', 'myHeightDir', '']],
    hostVars: 4,
    hostBindings: function HeightDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('height', ctx.myHeight);
        i0.ɵɵclassProp('bar', ctx.myBarClass);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HeightDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myHeightDir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myHeight: [{ type: HostBinding, args: ['style.height'] }],
          myBarClass: [{ type: HostBinding, args: ['class.bar'] }],
        },
      );
  }
}

export class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['myWidthDir', '', 'myHeightDir', '', 'myClassDir', '']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: [WidthDirective, HeightDirective, ClassDirective],
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
                selector: 'my-component',
                template: '<div myWidthDir myHeightDir myClassDir></div>',
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'multiple_directives.ts',
      lineNumber: 36,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyComponent, typeof WidthDirective, typeof HeightDirective, typeof ClassDirective],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [
              { declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective] },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective],
    });
})();

```