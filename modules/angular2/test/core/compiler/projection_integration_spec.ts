import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  beforeEachBindings,
  it,
  xit,
  containsRegexp,
  stringifyElement,
  TestComponentBuilder,
  RootTestComponent,
  fakeAsync,
  tick,
  By
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';

import * as viewAnn from 'angular2/src/core/annotations_impl/view';

import {
  Component,
  Directive,
  View,
  forwardRef,
  ViewContainerRef,
  ElementRef,
  TemplateRef,
  bind
} from 'angular2/angular2';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/render/render';

export function main() {
  describe('projection', () => {
    it('should support simple components',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<simple>' +
                            '<div>A</div>' +
                            '</simple>',
              directives: [Simple]
            }))
             .createAsync(MainComp)
             .then((main) => {
               expect(main.nativeElement).toHaveText('SIMPLE(A)');
               async.done();
             });
       }));

    it('should support simple components with text interpolation as direct children',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '{{\'START(\'}}<simple>' +
                            '{{text}}' +
                            '</simple>{{\')END\'}}',
              directives: [Simple]
            }))
             .createAsync(MainComp)
             .then((main) => {

               main.componentInstance.text = 'A';
               main.detectChanges();
               expect(main.nativeElement).toHaveText('START(SIMPLE(A))END');
               async.done();
             });
       }));

    it('should support projecting text interpolation to a non bound element',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(
                Simple,
                new viewAnn.View(
                    {template: 'SIMPLE(<div><ng-content></ng-content></div>)', directives: []}))
             .overrideView(
                 MainComp,
                 new viewAnn.View({template: '<simple>{{text}}</simple>', directives: [Simple]}))
             .createAsync(MainComp)
             .then((main) => {

               main.componentInstance.text = 'A';
               main.detectChanges();
               expect(main.nativeElement).toHaveText('SIMPLE(A)');
               async.done();
             });
       }));


    it('should support projecting text interpolation to a non bound element with other bound elements after it',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(Simple, new viewAnn.View({
              template: 'SIMPLE(<div><ng-content></ng-content></div><div [tab-index]="0">EL</div>)',
              directives: []
            }))
             .overrideView(
                 MainComp,
                 new viewAnn.View({template: '<simple>{{text}}</simple>', directives: [Simple]}))
             .createAsync(MainComp)
             .then((main) => {

               main.componentInstance.text = 'A';
               main.detectChanges();
               expect(main.nativeElement).toHaveText('SIMPLE(AEL)');
               async.done();
             });
       }));

    it('should not show the light dom even if there is no content tag',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp,
                          new viewAnn.View({template: '<empty>A</empty>', directives: [Empty]}))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.nativeElement).toHaveText('');
               async.done();
             });
       }));

    it('should support multiple content tags',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<multiple-content-tags>' +
                            '<div>B</div>' +
                            '<div>C</div>' +
                            '<div class="left">A</div>' +
                            '</multiple-content-tags>',
              directives: [MultipleContentTagsComponent]
            }))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.nativeElement).toHaveText('(A, BC)');
               async.done();
             });
       }));

    it('should redistribute only direct children',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<multiple-content-tags>' +
                            '<div>B<div class="left">A</div></div>' +
                            '<div>C</div>' +
                            '</multiple-content-tags>',
              directives: [MultipleContentTagsComponent]
            }))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.nativeElement).toHaveText('(, BAC)');
               async.done();
             });
       }));

    it("should redistribute direct child viewcontainers when the light dom changes",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<multiple-content-tags>' +
                            '<template manual class="left"><div>A1</div></template>' +
                            '<div>B</div>' +
                            '</multiple-content-tags>',
              directives: [MultipleContentTagsComponent, ManualViewportDirective]
            }))
             .createAsync(MainComp)
             .then((main) => {

               var viewportDirectives = main.queryAll(By.directive(ManualViewportDirective))
                                            .map(de => de.inject(ManualViewportDirective));

               expect(main.nativeElement).toHaveText('(, B)');
               viewportDirectives.forEach(d => d.show());
               expect(main.nativeElement).toHaveText('(A1, B)');

               viewportDirectives.forEach(d => d.hide());

               expect(main.nativeElement).toHaveText('(, B)');
               async.done();
             });
       }));

    it("should support nested components",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<outer-with-indirect-nested>' +
                            '<div>A</div>' +
                            '<div>B</div>' +
                            '</outer-with-indirect-nested>',
              directives: [OuterWithIndirectNestedComponent]
            }))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.nativeElement).toHaveText('OUTER(SIMPLE(AB))');
               async.done();
             });
       }));

    it("should support nesting with content being direct child of a nested component",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<outer>' +
                            '<template manual class="left"><div>A</div></template>' +
                            '<div>B</div>' +
                            '<div>C</div>' +
                            '</outer>',
              directives: [OuterComponent, ManualViewportDirective],
            }))
             .createAsync(MainComp)
             .then((main) => {

               var viewportDirective = main.query(By.directive(ManualViewportDirective))
                                           .inject(ManualViewportDirective);

               expect(main.nativeElement).toHaveText('OUTER(INNER(INNERINNER(,BC)))');
               viewportDirective.show();

               expect(main.nativeElement).toHaveText('OUTER(INNER(INNERINNER(A,BC)))');
               async.done();
             });
       }));

    it('should redistribute when the shadow dom changes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<conditional-content>' +
                            '<div class="left">A</div>' +
                            '<div>B</div>' +
                            '<div>C</div>' +
                            '</conditional-content>',
              directives: [ConditionalContentComponent]
            }))
             .createAsync(MainComp)
             .then((main) => {

               var viewportDirective = main.query(By.directive(ManualViewportDirective))
                                           .inject(ManualViewportDirective);

               expect(main.nativeElement).toHaveText('(, BC)');

               viewportDirective.show();
               expect(main.nativeElement).toHaveText('(A, BC)');

               viewportDirective.hide();

               expect(main.nativeElement).toHaveText('(, BC)');
               async.done();
             });
       }));

    // GH-2095 - https://github.com/angular/angular/issues/2095
    // important as we are removing the ng-content element during compilation,
    // which could skrew up text node indices.
    it('should support text nodes after content tags',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideView(
                MainComp,
                new viewAnn.View(
                    {template: '<simple string-prop="text"></simple>', directives: [Simple]}))
             .overrideTemplate(Simple, '<ng-content></ng-content><p>P,</p>{{stringProp}}')
             .createAsync(MainComp)
             .then((main) => {

               main.detectChanges();

               expect(main.nativeElement).toHaveText('P,text');
               async.done();
             });

       }));

    // important as we are moving style tags around during compilation,
    // which could skrew up text node indices.
    it('should support text nodes after style tags',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideView(
                MainComp,
                new viewAnn.View(
                    {template: '<simple string-prop="text"></simple>', directives: [Simple]}))
             .overrideTemplate(Simple, '<style></style><p>P,</p>{{stringProp}}')
             .createAsync(MainComp)
             .then((main) => {

               main.detectChanges();
               expect(main.nativeElement).toHaveText('P,text');
               async.done();
             });
       }));

    it('should support moving non projected light dom around',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<empty>' +
                            '  <template manual><div>A</div></template>' +
                            '</empty>' +
                            'START(<div project></div>)END',
              directives: [Empty, ProjectDirective, ManualViewportDirective],
            }))
             .createAsync(MainComp)
             .then((main) => {

               var sourceDirective: ManualViewportDirective =
                   main.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               var projectDirective: ProjectDirective =
                   main.query(By.directive(ProjectDirective)).inject(ProjectDirective);
               expect(main.nativeElement).toHaveText('START()END');

               projectDirective.show(sourceDirective.templateRef);
               expect(main.nativeElement).toHaveText('START(A)END');
               async.done();
             });
       }));

    it('should support moving projected light dom around',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<simple><template manual><div>A</div></template></simple>' +
                            'START(<div project></div>)END',
              directives: [Simple, ProjectDirective, ManualViewportDirective],
            }))
             .createAsync(MainComp)
             .then((main) => {

               var sourceDirective: ManualViewportDirective =
                   main.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               var projectDirective: ProjectDirective =
                   main.query(By.directive(ProjectDirective)).inject(ProjectDirective);
               expect(main.nativeElement).toHaveText('SIMPLE()START()END');

               projectDirective.show(sourceDirective.templateRef);
               expect(main.nativeElement).toHaveText('SIMPLE()START(A)END');
               async.done();
             });
       }));

    it('should support moving ng-content around',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new viewAnn.View({
              template: '<conditional-content>' +
                            '<div class="left">A</div>' +
                            '<div>B</div>' +
                            '</conditional-content>' +
                            'START(<div project></div>)END',
              directives:
                  [ConditionalContentComponent, ProjectDirective, ManualViewportDirective]
            }))
             .createAsync(MainComp)
             .then((main) => {

               var sourceDirective: ManualViewportDirective =
                   main.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               var projectDirective: ProjectDirective =
                   main.query(By.directive(ProjectDirective)).inject(ProjectDirective);
               expect(main.nativeElement).toHaveText('(, B)START()END');

               projectDirective.show(sourceDirective.templateRef);
               expect(main.nativeElement).toHaveText('(, B)START(A)END');

               // Stamping ng-content multiple times should not produce the content multiple
               // times...
               projectDirective.show(sourceDirective.templateRef);
               expect(main.nativeElement).toHaveText('(, B)START(A)END');
               async.done();
             });
       }));


    // Note: This does not use a ng-content element, but
    // is still important as we are merging proto views independent of
    // the presence of ng-content elements!
    it('should still allow to implement a recursive trees',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp,
                          new viewAnn.View({template: '<tree></tree>', directives: [Tree]}))
             .createAsync(MainComp)
             .then((main) => {

               main.detectChanges();
               var manualDirective: ManualViewportDirective =
                   main.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               expect(main.nativeElement).toHaveText('TREE(0:)');
               manualDirective.show();
               main.detectChanges();
               expect(main.nativeElement).toHaveText('TREE(0:TREE(1:))');
               async.done();
             });
       }));

    if (DOM.supportsNativeShadowDOM()) {
      describe('native shadow dom support', () => {
        beforeEachBindings(
            () => { return [bind(ShadowDomStrategy).toValue(new NativeShadowDomStrategy())]; });

        it('should support native content projection',
           inject([TestComponentBuilder, AsyncTestCompleter],
                  (tcb: TestComponentBuilder, async) => {
                    tcb.overrideView(MainComp, new viewAnn.View({
                         template: '<simple-native>' +
                                       '<div>A</div>' +
                                       '</simple-native>',
                         directives: [SimpleNative]
                       }))
                        .createAsync(MainComp)
                        .then((main) => {

                          expect(main.nativeElement).toHaveText('SIMPLE(A)');
                          async.done();
                        });
                  }));
      });
    }

  });
}

@Component({selector: 'main'})
@View({template: '', directives: []})
class MainComp {
  text: string = '';
}

@Component({selector: 'simple', properties: ['stringProp']})
@View({template: 'SIMPLE(<ng-content></ng-content>)', directives: []})
class Simple {
  stringProp: string = '';
}

@Component({selector: 'simple-native'})
@View({template: 'SIMPLE(<content></content>)', directives: []})
class SimpleNative {
}

@Component({selector: 'empty'})
@View({template: '', directives: []})
class Empty {
}

@Component({selector: 'multiple-content-tags'})
@View({
  template: '(<ng-content select=".left"></ng-content>, <ng-content></ng-content>)',
  directives: []
})
class MultipleContentTagsComponent {
}

@Directive({selector: '[manual]'})
class ManualViewportDirective {
  constructor(public vc: ViewContainerRef, public templateRef: TemplateRef) {}
  show() { this.vc.createEmbeddedView(this.templateRef, 0); }
  hide() { this.vc.clear(); }
}

@Directive({selector: '[project]'})
class ProjectDirective {
  constructor(public vc: ViewContainerRef) {}
  show(templateRef: TemplateRef) { this.vc.createEmbeddedView(templateRef, 0); }
  hide() { this.vc.clear(); }
}

@Component({selector: 'outer-with-indirect-nested'})
@View({
  template: 'OUTER(<simple><div><ng-content></ng-content></div></simple>)',
  directives: [Simple]
})
class OuterWithIndirectNestedComponent {
}

@Component({selector: 'outer'})
@View({
  template: 'OUTER(<inner><ng-content></ng-content></inner>)',
  directives: [forwardRef(() => InnerComponent)]
})
class OuterComponent {
}

@Component({selector: 'inner'})
@View({
  template: 'INNER(<innerinner><ng-content></ng-content></innerinner>)',
  directives: [forwardRef(() => InnerInnerComponent)]
})
class InnerComponent {
}

@Component({selector: 'innerinner'})
@View({
  template: 'INNERINNER(<ng-content select=".left"></ng-content>,<ng-content></ng-content>)',
  directives: []
})
class InnerInnerComponent {
}

@Component({selector: 'conditional-content'})
@View({
  template:
      '<div>(<div *manual><ng-content select=".left"></ng-content></div>, <ng-content></ng-content>)</div>',
  directives: [ManualViewportDirective]
})
class ConditionalContentComponent {
}

@Component({selector: 'tab'})
@View({
  template: '<div><div *manual>TAB(<ng-content></ng-content>)</div></div>',
  directives: [ManualViewportDirective]
})
class Tab {
}

@Component({selector: 'tree', properties: ['depth']})
@View({
  template: 'TREE({{depth}}:<tree *manual [depth]="depth+1"></tree>)',
  directives: [ManualViewportDirective, Tree]
})
class Tree {
  depth = 0;
}
