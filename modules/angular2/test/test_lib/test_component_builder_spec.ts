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
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/test_lib';

import {Injectable, NgIf, bind} from 'angular2/core';
import {Directive, Component, View, ViewMetadata} from 'angular2/src/core/metadata';

@Component({selector: 'child-comp'})
@View({template: `<span>Original {{childBinding}}</span>`, directives: []})
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

@Component({selector: 'child-child-comp'})
@View({template: `<span>ChildChild</span>`})
@Injectable()
class ChildChildComp {
}

@Component({selector: 'child-comp'})
@View({
  template: `<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>`,
  directives: [ChildChildComp]
})
@Injectable()
class ChildWithChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-child-comp'})
@View({template: `<span>ChildChild Mock</span>`})
@Injectable()
class MockChildChildComp {
}



class FancyService {
  value: string = 'real value';
}

class MockFancyService extends FancyService {
  value: string = 'mocked out value';
}

@Component({selector: 'my-service-comp', bindings: [FancyService]})
@View({template: `injected value: {{fancyService.value}}`})
class TestBindingsComp {
  constructor(private fancyService: FancyService) {}
}

@Component({selector: 'my-service-comp', viewBindings: [FancyService]})
@View({template: `injected value: {{fancyService.value}}`})
class TestViewBindingsComp {
  constructor(private fancyService: FancyService) {}
}


export function main() {
  describe('test component builder', function() {
    it('should instantiate a component with valid DOM',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(ChildComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();

           expect(rootTestComponent.nativeElement).toHaveText('Original Child');
           async.done();
         });
       }));

    it('should allow changing members of the component',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(MyIfComp).then((rootTestComponent) => {
           rootTestComponent.detectChanges();
           expect(rootTestComponent.nativeElement).toHaveText('MyIf()');

           rootTestComponent.componentInstance.showMore = true;
           rootTestComponent.detectChanges();
           expect(rootTestComponent.nativeElement).toHaveText('MyIf(More)');

           async.done();
         });
       }));

    it('should override a template',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
             .createAsync(MockChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.nativeElement).toHaveText('Mock');

               async.done();
             });
       }));

    it('should override a view',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideView(ChildComp,
                          new ViewMetadata({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.nativeElement).toHaveText('Modified Child');

               async.done();
             });
       }));

    it('should override component dependencies',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.nativeElement).toHaveText('Parent(Mock)');

               async.done();
             });
       }));


    it("should override child component's dependencies",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
             .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
             .createAsync(ParentComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.nativeElement)
                   .toHaveText('Parent(Original Child(ChildChild Mock))');

               async.done();
             });
       }));

    it('should override a binding',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideBindings(TestBindingsComp, [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestBindingsComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.nativeElement)
                   .toHaveText('injected value: mocked out value');
               async.done();
             });
       }));


    it('should override a viewBinding',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideViewBindings(TestViewBindingsComp,
                                  [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestViewBindingsComp)
             .then((rootTestComponent) => {
               rootTestComponent.detectChanges();
               expect(rootTestComponent.nativeElement)
                   .toHaveText('injected value: mocked out value');
               async.done();
             });
       }));
  });
}
