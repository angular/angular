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

import {CSSClass} from 'angular2/src/directives/class';

export function main() {
  describe('binding to CSS class list', () => {

    it('should add classes specified in an object literal',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="{foo: true, bar: false}"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo');

               async.done();
             });
       }));

    it('should add and remove classes based on changes in object literal values',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="{foo: condition, bar: !condition}"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo');

               view.context.condition = false;
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding bar');

               async.done();
             });
       }));

    it('should add and remove classes based on changes to the expression object',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="expr"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo');

               StringMapWrapper.set(view.context.expr, 'bar', true);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

               StringMapWrapper.set(view.context.expr, 'baz', true);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo bar baz');

               StringMapWrapper.delete(view.context.expr, 'bar');
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo baz');

               async.done();
             });
       }));

    it('should retain existing classes when expression evaluates to null',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="expr"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo');

               view.context.expr = null;
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo');

               view.context.expr = {'foo': false, 'bar': true};
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding bar');

               async.done();
             });
       }));

    it('should co-operate with the class attribute',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="expr" class="init foo"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               StringMapWrapper.set(view.context.expr, 'bar', true);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init foo ng-binding bar');

               StringMapWrapper.set(view.context.expr, 'foo', false);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init ng-binding bar');

               async.done();
             });
       }));

    it('should co-operate with the class attribute and class.name binding',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div class="init foo" [class]="expr" [class.baz]="condition"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init foo ng-binding baz');

               StringMapWrapper.set(view.context.expr, 'bar', true);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init foo ng-binding baz bar');

               StringMapWrapper.set(view.context.expr, 'foo', false);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init ng-binding baz bar');

               view.context.condition = false;
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init ng-binding bar');

               async.done();
             });
       }));
  })
}

@Component({selector: 'test-cmp'})
@View({directives: [CSSClass]})
class TestComponent {
  condition: boolean;
  expr;
  constructor() {
    this.condition = true;
    this.expr = {'foo': true, 'bar': false};
  }
}
