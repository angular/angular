# /out/app.component.ts
```ts
import {
  Component,
  ViewChild,
  ViewChildren,
  ContentChild,
  ContentChildren,
  viewChild,
  viewChildren,
  contentChild,
  contentChildren,
  ElementRef,
  TemplateRef,
  QueryList,
  forwardRef,
} from '@angular/core';
import * as core from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['content'];
const _c1 = ['contentItem'];
const _c2 = ['myDiv'];
const _c3 = ['myTpl'];
const _c4 = ['item'];
const _c5 = ['nsView'];
const _c6 = ['nsReqView'];
const _c7 = ['setterQuery'];

export class AppComponent {
  // Decorator queries
  div!: ElementRef;
  tpl!: TemplateRef<any>;

  items!: QueryList<ElementRef>;

  content!: ElementRef;

  contentItems!: QueryList<ElementRef>;

  forwardComponent!: SomeComponent;
  complexComponent!: any;

  set setterQuery(val: ElementRef) {}

  // Signal queries
  signalDiv = viewChild<ElementRef>(
    'myDiv',
    ...((ngDevMode ? [{ debugName: 'signalDiv' }] : /* istanbul ignore next */ []) as []),
  );
  signalTpl = viewChild('myTpl', {
    ...(ngDevMode ? { debugName: 'signalTpl' } : /* istanbul ignore next */ {}),
    read: TemplateRef,
  });
  signalItems = viewChildren<ElementRef>(
    'item',
    ...((ngDevMode ? [{ debugName: 'signalItems' }] : /* istanbul ignore next */ []) as []),
  );
  reqSignalDiv = viewChild.required<ElementRef>(
    'myDiv',
    ...((ngDevMode ? [{ debugName: 'reqSignalDiv' }] : /* istanbul ignore next */ []) as []),
  );

  signalContent = contentChild<ElementRef>('content', {
    ...(ngDevMode ? { debugName: 'signalContent' } : /* istanbul ignore next */ {}),
    descendants: true,
  });
  signalContentItems = contentChildren<ElementRef>('contentItem', {
    ...(ngDevMode ? { debugName: 'signalContentItems' } : /* istanbul ignore next */ {}),
    descendants: false,
  });

  namespacedView = core.viewChild('nsView');
  namespacedReqView = core.viewChild.required('nsReqView');
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    ['signalContent', 'signalContentItems', 'content', 'complexComponent', 'contentItems'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    contentQueries: function AppComponent_ContentQueries(
      rf: number,
      ctx: any,
      dirIndex: number,
    ): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.signalContent, _c0, 5)(
          dirIndex,
          ctx.signalContentItems,
          _c1,
          4,
        );
        i0.ɵɵcontentQuery(dirIndex, _c0, 5)(
          dirIndex,
          SomeModule.SomeDirective,
          5,
          core.TemplateRef,
        )(dirIndex, _c1, 4);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(2);
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.content = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.complexComponent = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.contentItems = _t);
      }
    },
    viewQuery: function AppComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.signalDiv, _c2, 5)(ctx.signalTpl, _c3, 5, TemplateRef)(
          ctx.signalItems,
          _c4,
          5,
        )(ctx.reqSignalDiv, _c2, 5)(ctx.namespacedView, _c5, 5)(ctx.namespacedReqView, _c6, 5);
        i0.ɵɵviewQuery(_c2, 5)(_c3, 7, TemplateRef)(SomeComponent, 5)(_c7, 5)(_c4, 1);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(6);
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.div = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.tpl = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.forwardComponent = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.setterQuery = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.items = _t);
      }
    },
    decls: 2,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵelement(1, 'slot');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<div><slot></slot></div>',
                standalone: true,
              },
            ],
          },
        ],
        null,
        {
          div: [{ type: ViewChild, args: ['myDiv'] }],
          tpl: [{ type: ViewChild, args: ['myTpl', { read: TemplateRef, static: true }] }],
          items: [{ type: ViewChildren, args: ['item', { emitDistinctChangesOnly: false }] }],
          content: [{ type: ContentChild, args: ['content', { descendants: true }] }],
          contentItems: [
            {
              type: ContentChildren,
              args: ['contentItem', { descendants: false, emitDistinctChangesOnly: true }],
            },
          ],
          forwardComponent: [{ type: ViewChild, args: [forwardRef(() => SomeComponent)] }],
          complexComponent: [
            { type: ContentChild, args: [SomeModule.SomeDirective, { read: core.TemplateRef }] },
          ],
          setterQuery: [{ type: ViewChild, args: ['setterQuery'] }],
          signalContent: [
            { type: i0.ContentChild, args: ['content', { isSignal: true, descendants: true }] },
          ],
          signalContentItems: [
            { type: i0.ContentChildren, args: ['contentItem', { isSignal: true }] },
          ],
          signalDiv: [{ type: i0.ViewChild, args: ['myDiv', { isSignal: true }] }],
          signalTpl: [
            { type: i0.ViewChild, args: ['myTpl', { isSignal: true, read: TemplateRef }] },
          ],
          signalItems: [{ type: i0.ViewChildren, args: ['item', { isSignal: true }] }],
          reqSignalDiv: [{ type: i0.ViewChild, args: ['myDiv', { isSignal: true }] }],
          namespacedView: [{ type: i0.ViewChild, args: ['nsView', { isSignal: true }] }],
          namespacedReqView: [{ type: i0.ViewChild, args: ['nsReqView', { isSignal: true }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 9,
    });
})();

```