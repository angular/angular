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
import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Component, View} from 'angular2/angular2';
import {TestBed} from 'angular2/src/test_lib/test_bed';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {CSSClass} from 'angular2/src/directives/class';

export function main() {
  describe('binding to CSS class list', () => {

    describe('expressions evaluating to objects', () => {

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
           var template = '<div [class]="objExpr"></div>';

           tb.createView(TestComponent, {html: template})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo');

                 StringMapWrapper.set(view.context.objExpr, 'bar', true);
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

                 StringMapWrapper.set(view.context.objExpr, 'baz', true);
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar baz');

                 StringMapWrapper.delete(view.context.objExpr, 'bar');
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo baz');

                 async.done();
               });
         }));

      it('should add and remove classes based on reference changes to the expression object',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var template = '<div [class]="objExpr"></div>';

           tb.createView(TestComponent, {html: template})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo');

                 view.context.objExpr = {foo: true, bar: true};
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

                 view.context.objExpr = {baz: true};
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding baz');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to lists', () => {

      it('should add classes specified in a list literal',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var template = `<div [class]="['foo', 'bar']"></div>`;

           tb.createView(TestComponent, {html: template})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var template = '<div [class]="arrExpr"></div>';

           tb.createView(TestComponent, {html: template})
               .then((view) => {

                 var arrExpr: List<string> = view.context.arrExpr;

                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo');

                 arrExpr.push('bar');
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

                 arrExpr[1] = 'baz';
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo baz');

                 ListWrapper.remove(view.context.arrExpr, 'baz');
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo');

                 async.done();
               });
         }));

      it('should add and remove classes when a reference changes',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var template = '<div [class]="arrExpr"></div>';

           tb.createView(TestComponent, {html: template})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo');

                 view.context.arrExpr = ['bar'];
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding bar');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to string', () => {

      it('should add classes specified in a string literal',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var template = `<div [class]="'foo bar'"></div>`;

           tb.createView(TestComponent, {html: template})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var template = '<div [class]="strExpr"></div>';

           tb.createView(TestComponent, {html: template})
               .then((view) => {
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo');

                 view.context.strExpr = 'foo bar';
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding foo bar');

                 view.context.strExpr = 'baz';
                 view.detectChanges();
                 expect(view.rootNodes[0].className).toEqual('ng-binding baz');

                 async.done();
               });
         }));
    });

    it('should remove active classes when expression evaluates to null',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="objExpr"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding foo');

               view.context.objExpr = null;
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding');

               view.context.objExpr = {'foo': false, 'bar': true};
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('ng-binding bar');

               async.done();
             });
       }));

    it('should have no effect when activated by a static class attribute',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div class="init foo"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               // TODO(pk): in CJS className isn't initialized properly if we don't mutate classes
               expect(ListWrapper.join(DOM.classList(view.rootNodes[0]), ' '))
                   .toEqual('init foo ng-binding');
               async.done();
             });
       }));

    it('should co-operate with the class attribute',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div [class]="objExpr" class="init foo"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               StringMapWrapper.set(view.context.objExpr, 'bar', true);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init foo ng-binding bar');

               StringMapWrapper.set(view.context.objExpr, 'foo', false);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init ng-binding bar');

               async.done();
             });
       }));

    it('should co-operate with the class attribute and class.name binding',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var template = '<div class="init foo" [class]="objExpr" [class.baz]="condition"></div>';

         tb.createView(TestComponent, {html: template})
             .then((view) => {
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init foo ng-binding baz');

               StringMapWrapper.set(view.context.objExpr, 'bar', true);
               view.detectChanges();
               expect(view.rootNodes[0].className).toEqual('init foo ng-binding baz bar');

               StringMapWrapper.set(view.context.objExpr, 'foo', false);
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
  condition: boolean = true;
  arrExpr: List<string> = ['foo'];
  objExpr = {'foo': true, 'bar': false};
  strExpr = 'foo';
}
