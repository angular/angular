# /out/content_query_read_token.ngtypecheck.ts
```ts
/**
 * TCB for /content_query_read_token.ts
 * @generated
 */

import * as i0 from './content_query_read_token';

/*tcb1*/
function _tcb1(this: i0.ContentQueryComponent) {
  if (true) {
  }
}

```

# /out/content_query_read_token.ts
```ts
import {
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  NgModule,
  QueryList,
  TemplateRef,
} from '@angular/core';

import { SomeDirective } from './some.directive';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['myRef'];
const _c1 = ['myRef1', 'myRef2', 'myRef3'];

export class ContentQueryComponent {
  myRef!: TemplateRef<unknown>;
  myRefs!: QueryList<ElementRef>;
  someDir!: ElementRef;
  someDirs!: QueryList<TemplateRef<unknown>>;
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
    ['myRef', 'someDir', 'myRefs', 'someDirs'],
    never,
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
        i0.ɵɵcontentQuery(dirIndex, _c0, 5, TemplateRef)(dirIndex, SomeDirective, 5, ElementRef)(
          dirIndex,
          _c1,
          4,
          ElementRef,
        )(dirIndex, SomeDirective, 4, TemplateRef);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRef = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDir = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRefs = _t);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDirs = _t);
      }
    },
    standalone: false,
    decls: 5,
    vars: 0,
    consts: [
      ['myRef', ''],
      ['myRef1', ''],
      ['someDir', ''],
    ],
    template: function ContentQueryComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 2)(1, 'div', null, 0)(3, 'div', null, 1);
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
        <div someDir></div>
        <div #myRef></div>
        <div #myRef1></div>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myRef: [{ type: ContentChild, args: ['myRef', { read: TemplateRef }] }],
          myRefs: [
            { type: ContentChildren, args: ['myRef1, myRef2, myRef3', { read: ElementRef }] },
          ],
          someDir: [{ type: ContentChild, args: [SomeDirective, { read: ElementRef }] }],
          someDirs: [{ type: ContentChildren, args: [SomeDirective, { read: TemplateRef }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ContentQueryComponent, {
      className: 'ContentQueryComponent',
      filePath: 'content_query_read_token.ts',
      lineNumber: 14,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ContentQueryComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [ContentQueryComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ContentQueryComponent] });
})();

```

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