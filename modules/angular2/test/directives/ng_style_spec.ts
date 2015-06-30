import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  beforeEachBindings,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {StringMapWrapper} from 'angular2/src/facade/collection';

import {Component, View} from 'angular2/angular2';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {NgStyle} from 'angular2/src/directives/ng_style';

export function main() {
  describe('binding to CSS styles', () => {

    it('should add styles specified in an object literal',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = `<div [ng-style]="{'text-align': 'right'}"></div>`;

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('right');

               async.done();
             });
       }));

    it('should add and change styles specified in an object expression',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = `<div [ng-style]="expr"></div>`;

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               var expr: Map<string, any>;

               rootTC.componentInstance.expr = {'text-align': 'right'};
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('right');

               expr = rootTC.componentInstance.expr;
               expr['text-align'] = 'left';
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('left');

               async.done();
             });
       }));

    it('should remove styles when deleting a key in an object expression',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = `<div [ng-style]="expr"></div>`;

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.componentInstance.expr = {'text-align': 'right'};
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('right');

               StringMapWrapper.delete(rootTC.componentInstance.expr, 'text-align');
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('');

               async.done();
             });
       }));

    it('should co-operate with the style attribute',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = `<div style="font-size: 12px" [ng-style]="expr"></div>`;

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.componentInstance.expr = {'text-align': 'right'};
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('right');
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'font-size'))
                   .toEqual('12px');

               StringMapWrapper.delete(rootTC.componentInstance.expr, 'text-align');
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('');
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'font-size'))
                   .toEqual('12px');

               async.done();
             });
       }));

    it('should co-operate with the style.[styleName]="expr" special-case in the compiler',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = `<div [style.font-size.px]="12" [ng-style]="expr"></div>`;

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.componentInstance.expr = {'text-align': 'right'};
               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('right');
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'font-size'))
                   .toEqual('12px');

               StringMapWrapper.delete(rootTC.componentInstance.expr, 'text-align');
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'font-size'))
                   .toEqual('12px');

               rootTC.detectChanges();
               expect(DOM.getStyle(rootTC.componentViewChildren[0].nativeElement, 'text-align'))
                   .toEqual('');

               async.done();
             });
       }));
  })
}

@Component({selector: 'test-cmp'})
@View({directives: [NgStyle]})
class TestComponent {
  expr;
}
