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
import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Component, View} from 'angular2/angular2';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {CSSClass} from 'angular2/src/directives/class';

export function main() {
  describe('binding to CSS class list', () => {

    describe('expressions evaluating to objects', () => {

      it('should add classes specified in an object literal',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="{foo: true, bar: false}"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes in object literal values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="{foo: condition, bar: !condition}"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 rootTC.componentInstance.condition = false;
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression object',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'baz', true);
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar baz');

                 StringMapWrapper.delete(rootTC.componentInstance.objExpr, 'bar');
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo baz');

                 async.done();
               });
         }));

      it('should add and remove classes based on reference changes to the expression object',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 rootTC.componentInstance.objExpr = {foo: true, bar: true};
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar');

                 rootTC.componentInstance.objExpr = {baz: true};
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding baz');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to lists', () => {

      it('should add classes specified in a list literal',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [class]="['foo', 'bar']"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {

                 var arrExpr: List<string> = rootTC.componentInstance.arrExpr;

                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 arrExpr.push('bar');
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar');

                 arrExpr[1] = 'baz';
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo baz');

                 ListWrapper.remove(rootTC.componentInstance.arrExpr, 'baz');
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 async.done();
               });
         }));

      it('should add and remove classes when a reference changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 rootTC.componentInstance.arrExpr = ['bar'];
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding bar');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to string', () => {

      it('should add classes specified in a string literal',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [class]="'foo bar'"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [class]="strExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 rootTC.componentInstance.strExpr = 'foo bar';
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo bar');

                 rootTC.componentInstance.strExpr = 'baz';
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding baz');

                 async.done();
               });
         }));


      it('should remove active classes when switching from string to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [class]="strExpr"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding foo');

                 rootTC.componentInstance.strExpr = null;
                 rootTC.detectChanges();
                 expect(rootTC.componentViewChildren[0].nativeElement.className)
                     .toEqual('ng-binding');

                 async.done();
               });
         }));
    });

    it('should remove active classes when expression evaluates to null',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div [class]="objExpr"></div>';

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('ng-binding foo');

               rootTC.componentInstance.objExpr = null;
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('ng-binding');

               rootTC.componentInstance.objExpr = {'foo': false, 'bar': true};
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('ng-binding bar');

               async.done();
             });
       }));

    it('should have no effect when activated by a static class attribute',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div class="init foo"></div>';

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();
               // TODO(pk): in CJS className isn't initialized properly if we don't mutate classes
               expect(ListWrapper.join(DOM.classList(rootTC.componentViewChildren[0].nativeElement),
                                       ' '))
                   .toEqual('init foo ng-binding');
               async.done();
             });
       }));

    it('should co-operate with the class attribute',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div [class]="objExpr" class="init foo"></div>';

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('init foo ng-binding bar');

               StringMapWrapper.set(rootTC.componentInstance.objExpr, 'foo', false);
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('init ng-binding bar');

               async.done();
             });
       }));

    it('should co-operate with the class attribute and class.name binding',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var template = '<div class="init foo" [class]="objExpr" [class.baz]="condition"></div>';

         tcb.overrideTemplate(TestComponent, template)
             .createAsync(TestComponent)
             .then((rootTC) => {
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('init foo ng-binding baz');

               StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('init foo ng-binding baz bar');

               StringMapWrapper.set(rootTC.componentInstance.objExpr, 'foo', false);
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('init ng-binding baz bar');

               rootTC.componentInstance.condition = false;
               rootTC.detectChanges();
               expect(rootTC.componentViewChildren[0].nativeElement.className)
                   .toEqual('init ng-binding bar');

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
