import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  dispatchEvent,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/test_lib';

import {Injectable} from 'angular2/di';

import {
  Directive,
  Component,
  View,
} from 'angular2/annotations';

import * as viewAnn from 'angular2/src/core/annotations_impl/view';

import {NgIf} from 'angular2/src/directives/ng_if';

@Component({selector: 'child-comp'})
@View({template: `<snap>Original {{childBinding}}</span>`, directives: []})
@Injectable()
class ChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-comp'})
@View({template: `<span>Mock</span>`})
@Injectable()
class MockChildComp {
}

@Component({selector: 'parent-comp'})
@View({template: `Parent(<child-comp></child-comp>)`, directives: [ChildComp]})
@Injectable()
class ParentComp {
}

@Component({selector: 'my-if-comp'})
@View({template: `MyIf(<span *ng-if="showMore">More</span>)`, directives: [NgIf]})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

export function main() {
  describe('test component builder', function() {
    it('should instantiate a component with valid DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ChildComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();

           expect(rootTestComponent.domElement).toHaveText('Original Child');
           async.done();
         });
       }));

    it('should allow changing members of the component',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(MyIfComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();
           expect(rootTestComponent.domElement).toHaveText('MyIf()');

           rootTestComponent.componentInstance.showMore = true;
           rootTestComponent.detectChanges();
           expect(rootTestComponent.domElement).toHaveText('MyIf(More)');

           async.done();
         });
       }));

    it('should override a template',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
             .createAsync(MockChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.domElement).toHaveText('Mock');

               async.done();
             });
       }));

    it('should override a view',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideView(ChildComp,
                          new viewAnn.View({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.domElement).toHaveText('Modified Child');

               async.done();
             });
       }));

    it('should override component dependencies',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.domElement).toHaveText('Parent(Mock)');

               async.done();
             });
       }));
  });
}
