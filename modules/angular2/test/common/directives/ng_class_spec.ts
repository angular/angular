import {
  ComponentFixture,
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
} from 'angular2/testing_internal';
import {ListWrapper, StringMapWrapper, SetWrapper} from 'angular2/src/facade/collection';
import {Component, View, NgFor, provide} from 'angular2/angular2';
import {NgClass} from 'angular2/src/common/directives/ng_class';
import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';

function detectChangesAndCheck(fixture: ComponentFixture, classes: string, elIndex: number = 0) {
  fixture.detectChanges();
  expect(fixture.debugElement.componentViewChildren[elIndex].nativeElement.className)
      .toEqual(classes);
}

export function main() {
  describe('binding to CSS class list', () => {

    describe('viewpool support', () => {
      beforeEachBindings(() => { return [provide(APP_VIEW_POOL_CAPACITY, {useValue: 100})]; });

      it('should clean up when the directive is destroyed',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div *ng-for="var item of items" [ng-class]="item"></div>';
           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.debugElement.componentInstance.items = [['0']];
                 fixture.detectChanges();
                 fixture.debugElement.componentInstance.items = [['1']];

                 detectChangesAndCheck(fixture, '1', 1);

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
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');
                 async.done();
               });
         }));


      it('should add classes specified in an object literal without change in class names',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="{'foo-bar': true, 'fooBar': true}"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo-bar fooBar');
                 async.done();
               });
         }));

      it('should add and remove classes based on changes in object literal values',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="{foo: condition, bar: !condition}"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.condition = false;
                 detectChangesAndCheck(fixture, 'bar');

                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression object',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(fixture, 'foo bar');

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'baz', true);
                 detectChangesAndCheck(fixture, 'foo bar baz');

                 StringMapWrapper.delete(fixture.debugElement.componentInstance.objExpr, 'bar');
                 detectChangesAndCheck(fixture, 'foo baz');

                 async.done();
               });
         }));

      it('should add and remove classes based on reference changes to the expression object',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.objExpr = {foo: true, bar: true};
                 detectChangesAndCheck(fixture, 'foo bar');

                 fixture.debugElement.componentInstance.objExpr = {baz: true};
                 detectChangesAndCheck(fixture, 'baz');

                 async.done();
               });
         }));

      it('should remove active classes when expression evaluates to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="objExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.objExpr = null;
                 detectChangesAndCheck(fixture, '');

                 fixture.debugElement.componentInstance.objExpr = {'foo': false, 'bar': true};
                 detectChangesAndCheck(fixture, 'bar');

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
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo bar foo-bar fooBar');
                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 var arrExpr: string[] = fixture.debugElement.componentInstance.arrExpr;
                 detectChangesAndCheck(fixture, 'foo');

                 arrExpr.push('bar');
                 detectChangesAndCheck(fixture, 'foo bar');

                 arrExpr[1] = 'baz';
                 detectChangesAndCheck(fixture, 'foo baz');

                 ListWrapper.remove(fixture.debugElement.componentInstance.arrExpr, 'baz');
                 detectChangesAndCheck(fixture, 'foo');

                 async.done();
               });
         }));

      it('should add and remove classes when a reference changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.arrExpr = ['bar'];
                 detectChangesAndCheck(fixture, 'bar');

                 async.done();
               });
         }));

      it('should take initial classes into account when a reference changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div class="foo" [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.arrExpr = ['bar'];
                 detectChangesAndCheck(fixture, 'foo bar');

                 async.done();
               });
         }));

      it('should ignore empty or blank class names',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div class="foo" [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {

                 fixture.debugElement.componentInstance.arrExpr = ['', '  '];
                 detectChangesAndCheck(fixture, 'foo');

                 async.done();
               });
         }));

      it('should trim blanks from class names',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div class="foo" [ng-class]="arrExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {

                 fixture.debugElement.componentInstance.arrExpr = [' bar  '];
                 detectChangesAndCheck(fixture, 'foo bar');

                 async.done();
               });
         }));
    });

    describe('expressions evaluating to sets', () => {

      it('should add and remove classes if the set instance changed',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="setExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 var setExpr = new Set<string>();
                 setExpr.add('bar');
                 fixture.debugElement.componentInstance.setExpr = setExpr;
                 detectChangesAndCheck(fixture, 'bar');

                 setExpr = new Set<string>();
                 setExpr.add('baz');
                 fixture.debugElement.componentInstance.setExpr = setExpr;
                 detectChangesAndCheck(fixture, 'baz');

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
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo bar foo-bar fooBar');
                 async.done();
               });
         }));

      it('should add and remove classes based on changes to the expression',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div [ng-class]="strExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.strExpr = 'foo bar';
                 detectChangesAndCheck(fixture, 'foo bar');


                 fixture.debugElement.componentInstance.strExpr = 'baz';
                 detectChangesAndCheck(fixture, 'baz');

                 async.done();
               });
         }));

      it('should remove active classes when switching from string to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="strExpr"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.strExpr = null;
                 detectChangesAndCheck(fixture, '');

                 async.done();
               });
         }));

      it('should take initial classes into account when switching from string to null',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div class="foo" [ng-class]="strExpr"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'foo');

                 fixture.debugElement.componentInstance.strExpr = null;
                 detectChangesAndCheck(fixture, 'foo');

                 async.done();
               });
         }));

      it('should ignore empty and blank strings',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div class="foo" [ng-class]="strExpr"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 fixture.debugElement.componentInstance.strExpr = '';
                 detectChangesAndCheck(fixture, 'foo');

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
               .then((fixture) => {
                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(fixture, 'init foo bar');

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(fixture, 'init bar');

                 fixture.debugElement.componentInstance.objExpr = null;
                 detectChangesAndCheck(fixture, 'init foo');

                 async.done();
               });
         }));

      it('should co-operate with the interpolated class attribute',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="objExpr" class="{{'init foo'}}"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(fixture, `init foo bar`);

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(fixture, `init bar`);

                 fixture.debugElement.componentInstance.objExpr = null;
                 detectChangesAndCheck(fixture, `init foo`);

                 async.done();
               });
         }));

      it('should co-operate with the class attribute and binding to it',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = `<div [ng-class]="objExpr" class="init" [class]="'foo'"></div>`;

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(fixture, `init foo bar`);

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(fixture, `init bar`);

                 fixture.debugElement.componentInstance.objExpr = null;
                 detectChangesAndCheck(fixture, `init foo`);

                 async.done();
               });
         }));

      it('should co-operate with the class attribute and class.name binding',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template =
               '<div class="init foo" [ng-class]="objExpr" [class.baz]="condition"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'init foo baz');

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(fixture, 'init foo baz bar');

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
                 detectChangesAndCheck(fixture, 'init baz bar');

                 fixture.debugElement.componentInstance.condition = false;
                 detectChangesAndCheck(fixture, 'init bar');

                 async.done();
               });
         }));

      it('should co-operate with initial class and class attribute binding when binding changes',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var template = '<div class="init" [ng-class]="objExpr" [class]="strExpr"></div>';

           tcb.overrideTemplate(TestComponent, template)
               .createAsync(TestComponent)
               .then((fixture) => {
                 detectChangesAndCheck(fixture, 'init foo');

                 StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
                 detectChangesAndCheck(fixture, 'init foo bar');

                 fixture.debugElement.componentInstance.strExpr = 'baz';
                 detectChangesAndCheck(fixture, 'init bar baz foo');

                 fixture.debugElement.componentInstance.objExpr = null;
                 detectChangesAndCheck(fixture, 'init baz');

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
  setExpr: Set<string> = new Set<string>();
  objExpr = {'foo': true, 'bar': false};
  strExpr = 'foo';

  constructor() { this.setExpr.add('foo'); }
}
