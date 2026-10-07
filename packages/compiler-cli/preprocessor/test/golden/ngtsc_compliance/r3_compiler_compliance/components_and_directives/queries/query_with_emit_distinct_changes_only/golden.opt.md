# /out/query_with_emit_distinct_changes_only.ngtypecheck.ts
```ts
/**
 * TCB for /query_with_emit_distinct_changes_only.ts
 * @generated
 */

import * as i0 from './query_with_emit_distinct_changes_only';

/*tcb1*/
function _tcb1(this: i0.ContentQueryComponent) {
  if (true) {
  }
}

```

# /out/query_with_emit_distinct_changes_only.ts
```ts
import {
  Component,
  ContentChildren,
  ElementRef,
  NgModule,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';

import { SomeDirective } from './some.directive';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['myRef'];

export class ContentQueryComponent {
  myRefs!: QueryList<ElementRef>;
  oldMyRefs!: QueryList<ElementRef>;

  someDirs!: QueryList<any>;
  oldSomeDirs!: QueryList<any>;
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
    ['myRefs', 'oldMyRefs'],
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
        i0.ɵɵcontentQuery(dirIndex, _c0, 4)(dirIndex, _c0, 0);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRefs = _t);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.oldMyRefs = _t);
      }
    },
    viewQuery: function ContentQueryComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(SomeDirective, 5)(SomeDirective, 1);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDirs = _t);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.oldSomeDirs = _t);
      }
    },
    standalone: false,
    decls: 3,
    vars: 0,
    consts: [
      ['myRef', ''],
      ['someDir', ''],
    ],
    template: function ContentQueryComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 1)(1, 'div', null, 0);
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
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myRefs: [{ type: ContentChildren, args: ['myRef', { emitDistinctChangesOnly: true }] }],
          oldMyRefs: [
            { type: ContentChildren, args: ['myRef', { emitDistinctChangesOnly: false }] },
          ],
          someDirs: [
            { type: ViewChildren, args: [SomeDirective, { emitDistinctChangesOnly: true }] },
          ],
          oldSomeDirs: [
            { type: ViewChildren, args: [SomeDirective, { emitDistinctChangesOnly: false }] },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ContentQueryComponent, {
      className: 'ContentQueryComponent',
      filePath: 'query_with_emit_distinct_changes_only.ts',
      lineNumber: 13,
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