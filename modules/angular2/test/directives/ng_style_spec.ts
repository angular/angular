import {
  AsyncTestCompleter,
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

import {TestBed} from 'angular2/src/test_lib/test_bed';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {NgStyle} from 'angular2/src/directives/ng_style';

export function main() {
  describe('binding to CSS styles', () => {

    it('should add styles specified in an object literal',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = `<div [ng-style]="{'text-align': 'right'}"></div>`;

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('right');

               async.done();
             });
       }));

    it('should add and change styles specified in an object expression',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = `<div [ng-style]="expr"></div>`;

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               var expr: Map<string, any>;

               view.context.expr = {'text-align': 'right'};
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('right');

               expr = view.context.expr;
               expr['text-align'] = 'left';
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('left');

               async.done();
             });
       }));

    it('should remove styles when deleting a key in an object expression',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = `<div [ng-style]="expr"></div>`;

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.context.expr = {'text-align': 'right'};
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('right');

               StringMapWrapper.delete(view.context.expr, 'text-align');
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('');

               async.done();
             });
       }));

    it('should co-operate with the style attribute',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = `<div style="font-size: 12px" [ng-style]="expr"></div>`;

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.context.expr = {'text-align': 'right'};
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('right');
               expect(DOM.getStyle(view.rootNodes[0], 'font-size')).toEqual('12px');

               StringMapWrapper.delete(view.context.expr, 'text-align');
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('');
               expect(DOM.getStyle(view.rootNodes[0], 'font-size')).toEqual('12px');

               async.done();
             });
       }));

    it('should co-operate with the style.[styleName]="expr" special-case in the compiler',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = `<div [style.font-size.px]="12" [ng-style]="expr"></div>`;

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.context.expr = {'text-align': 'right'};
               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('right');
               expect(DOM.getStyle(view.rootNodes[0], 'font-size')).toEqual('12px');

               StringMapWrapper.delete(view.context.expr, 'text-align');
               expect(DOM.getStyle(view.rootNodes[0], 'font-size')).toEqual('12px');

               view.detectChanges();
               expect(DOM.getStyle(view.rootNodes[0], 'text-align')).toEqual('');

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
