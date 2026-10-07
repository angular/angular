# /out/some.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SomeDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never> = function SomeDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SomeDirective,
    '[someDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [['', 'someDir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[someDir]',
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

```

# /out/static_content_query.ngtypecheck.ts
```ts
/**
 * TCB for /static_content_query.ts
 * @generated
 */

import * as i0 from './static_content_query';

/*tcb1*/
function _tcb1(this: i0.ContentQueryComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/static_content_query.ts
```ts
import { Component, ContentChild, ElementRef, NgModule } from '@angular/core';

import { SomeDirective } from './some.directive';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['foo'];
const _c1 = ['*'];

export class ContentQueryComponent {
  someDir!: SomeDirective;
  foo!: ElementRef;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never> =
    function ContentQueryComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ContentQueryComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ContentQueryComponent,
    'content-query-component',
    never,
    {},
    {},
    ['someDir', 'foo'],
    ['*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ContentQueryComponent,
    selectors: [['content-query-component']],
    contentQueries: function ContentQueryComponent_ContentQueries(
      rf: number,
      ctx: any,
      dirIndex: number,
    ): any {
      if (rf & 1) {
        i0.ɵɵcontentQuery(dirIndex, SomeDirective, 7)(dirIndex, _c0, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDir = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.foo = _t.first);
      }
    },
    standalone: false,
    ngContentSelectors: _c1,
    decls: 2,
    vars: 0,
    template: function ContentQueryComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ContentQueryComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'content-query-component',
                template: `
        <div><ng-content></ng-content></div>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          someDir: [{ type: ContentChild, args: [SomeDirective, { static: true }] }],
          foo: [{ type: ContentChild, args: ['foo'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ContentQueryComponent, {
      className: 'ContentQueryComponent',
      filePath: 'static_content_query.ts',
      lineNumber: 12,
    });
})();

export class MyApp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 2,
    vars: 0,
    consts: [['someDir', '']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'content-query-component');
        i0.ɵɵelement(1, 'div', 0);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: (): any => [SomeDirective, ContentQueryComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: `
        <content-query-component>
          <div someDir></div>
        </content-query-component>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'static_content_query.ts',
      lineNumber: 26,
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
    [typeof SomeDirective, typeof ContentQueryComponent, typeof MyApp],
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
            args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }],
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
      declarations: [SomeDirective, ContentQueryComponent, MyApp],
    });
})();

```