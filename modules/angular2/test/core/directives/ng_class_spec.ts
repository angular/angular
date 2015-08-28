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
import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {Component, View, NgFor, bind} from 'angular2/angular2';
import {NgClass} from 'angular2/src/core/directives/ng_class';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';

function detectChangesAndCheck(rootTC, classes: string, elIndex: number = 0) {
  rootTC.detectChanges();
  expect(rootTC.componentViewChildren[elIndex].nativeElement.className).toEqual(classes);
}

export function main() {
  describe('binding to CSS class list', () => {

    describe('viewpool support', () => {
      beforeEachBindings(() => { return [bind(APP_VIEW_POOL_CAPACITY).toValue(100)]; });

      it('should clean up when the directive is destroyed',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div *ng-for="var item of items" [ng-class]="item"></div>';
           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 rootTC.componentInstance.items = [['0']];
                 rootTC.detectChanges();
                 rootTC.componentInstance.items = [['1']];

                 detectChangesAndCheck(rootTC, 'ng-binding 1', 1);

                 async.done();
               });
         }));
    });


    describe('expressions evaluating to objects', () => {

      it('should add classes specified in an object literal',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="{foo: true, bar: false}"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');
                 async.done();
               });
         }));


      it('should add classes specified in an object literal without change in class names',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="{'foo-bar': true, 'fooBar': true}"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo-bar fooBar');
                 async.done();
               });
         }));

      it('should add and remove classes based on changes in object literal values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="{foo: condition, bar: !condition}"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 rootTC.componentInstance.condition = false;
                 detectChangesAndCheck(rootTC, 'ng-binding bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression object',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'baz', true);
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar baz');

                 StringMapWrapper.delete(rootTC.componentInstance.objExpr, 'bar');
                 detectChangesAndCheck(rootTC, 'ng-binding foo baz');

                 async.done();
               });
         }));

      it('should add and remove classes based on reference changes to the expression object',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 rootTC.componentInstance.objExpr = {foo: true, bar: true};
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar');

                 rootTC.componentInstance.objExpr = {baz: true};
                 detectChangesAndCheck(rootTC, 'ng-binding baz');

                 async.done();
               });
         }));

      it('should remove active classes when expression evaluates to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 rootTC.componentInstance.objExpr = null;
                 detectChangesAndCheck(rootTC, 'ng-binding');

                 rootTC.componentInstance.objExpr = {'foo': false, 'bar': true};
                 detectChangesAndCheck(rootTC, 'ng-binding bar');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to lists', () => {

      it('should add classes specified in a list literal',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="['foo', 'bar', 'foo-bar', 'fooBar']"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar foo-bar fooBar');
                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 var arrExpr: string[] = rootTC.componentInstance.arrExpr;
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 arrExpr.push('bar');
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar');

                 arrExpr[1] = 'baz';
                 detectChangesAndCheck(rootTC, 'ng-binding foo baz');

                 ListWrapper.remove(rootTC.componentInstance.arrExpr, 'baz');
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 async.done();
               });
         }));

      it('should add and remove classes when a reference changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 rootTC.componentInstance.arrExpr = ['bar'];
                 detectChangesAndCheck(rootTC, 'ng-binding bar');

                 async.done();
               });
         }));

      it('should take initial classes into account when a reference changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div class="foo" [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'foo ng-binding');

                 rootTC.componentInstance.arrExpr = ['bar'];
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to string', () => {

      it('should add classes specified in a string literal',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="'foo bar foo-bar fooBar'"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar foo-bar fooBar');
                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="strExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 rootTC.componentInstance.strExpr = 'foo bar';
                 detectChangesAndCheck(rootTC, 'ng-binding foo bar');


                 rootTC.componentInstance.strExpr = 'baz';
                 detectChangesAndCheck(rootTC, 'ng-binding baz');

                 async.done();
               });
         }));

      it('should remove active classes when switching from string to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="strExpr"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 rootTC.componentInstance.strExpr = null;
                 detectChangesAndCheck(rootTC, 'ng-binding');

                 async.done();
               });
         }));

      it('should take initial classes into account when switching from string to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div class="foo" [ng-class]="strExpr"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'foo ng-binding');

                 rootTC.componentInstance.strExpr = null;
                 detectChangesAndCheck(rootTC, 'ng-binding foo');

                 async.done();
               });
         }));

    });

    describe('cooperation with other class-changing constructs', () => {

      it('should co-operate with the class attribute',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr" class="init foo"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(rootTC, 'init foo ng-binding bar');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(rootTC, 'init ng-binding bar');

                 rootTC.componentInstance.objExpr = null;
                 detectChangesAndCheck(rootTC, 'init ng-binding foo');

                 async.done();
               });
         }));

      it('should co-operate with the interpolated class attribute',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="objExpr" class="{{'init foo'}}"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(rootTC, `{{'init foo'}} ng-binding init foo bar`);

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(rootTC, `{{'init foo'}} ng-binding init bar`);

                 rootTC.componentInstance.objExpr = null;
                 detectChangesAndCheck(rootTC, `{{'init foo'}} ng-binding init foo`);

                 async.done();
               });
         }));

      it('should co-operate with the class attribute and binding to it',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="objExpr" class="init" [class]="'foo'"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(rootTC, `init ng-binding foo bar`);

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(rootTC, `init ng-binding bar`);

                 rootTC.componentInstance.objExpr = null;
                 detectChangesAndCheck(rootTC, `init ng-binding foo`);

                 async.done();
               });
         }));

      it('should co-operate with the class attribute and class.name binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div class="init foo" [ng-class]="objExpr" [class.baz]="condition"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'init foo ng-binding baz');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(rootTC, 'init foo ng-binding baz bar');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(rootTC, 'init ng-binding baz bar');

                 rootTC.componentInstance.condition = false;
                 detectChangesAndCheck(rootTC, 'init ng-binding bar');

                 async.done();
               });
         }));

      it('should co-operate with initial class and class attribute binding when binding changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div class="init" [ng-class]="objExpr" [class]="strExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((rootTC) => {
                 detectChangesAndCheck(rootTC, 'init ng-binding foo');

                 StringMapWrapper.set(rootTC.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(rootTC, 'init ng-binding foo bar');

                 rootTC.componentInstance.strExpr = 'baz';
                 detectChangesAndCheck(rootTC, 'init ng-binding bar baz foo');

                 rootTC.componentInstance.objExpr = null;
                 detectChangesAndCheck(rootTC, 'init ng-binding baz');

                 async.done();
               });
         }));

    });
  })
}

@Component({selector: 'test-cmp'})
@View({directives: [NgClass, NgFor]})
class TestComponent {
  condition: boolean = true;
  items: any[];
  arrExpr: string[] = ['foo'];
  objExpr = {'foo': true, 'bar': false};
  strExpr = 'foo';
}
