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
  beforeEachBindings,
  it,
  xit,
  containsRegexp,
  stringifyElement,
  TestComponentBuilder,
  RootTestComponent,
  fakeAsync,
  tick
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {
  bind,
  forwardRef,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  View,
  ViewContainerRef,
  ViewEncapsulation,
  ViewMetadata
} from 'angular2/core';
import {By} from 'angular2/src/core/debug';

export function main() {
  describe('projection', () => {
    it('should support simple components',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<simple>' +
                                          '<div>A</div>' +
                                          '</simple>',
                            directives: [Simple]
                          }))
             .createAsync(MainComp)
             .then((main) => {
               expect(main.debugElement.nativeElement).toHaveText('SIMPLE(A)');
               async.done();
             });
       }));

    it('should support simple components with text interpolation as direct children',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '{{\'START(\'}}<simple>' +
                                          '{{text}}' +
                                          '</simple>{{\')END\'}}',
                            directives: [Simple]
                          }))
             .createAsync(MainComp)
             .then((main) => {

               main.debugElement.componentInstance.text = 'A';
               main.detectChanges();
               expect(main.debugElement.nativeElement).toHaveText('START(SIMPLE(A))END');
               async.done();
             });
       }));

    it('should support projecting text interpolation to a non bound element',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(
                Simple,
                new ViewMetadata(
                    {template: 'SIMPLE(<div><ng-content></ng-content></div>)', directives: []}))
             .overrideView(
                 MainComp,
                 new ViewMetadata({template: '<simple>{{text}}</simple>', directives: [Simple]}))
             .createAsync(MainComp)
             .then((main) => {

               main.debugElement.componentInstance.text = 'A';
               main.detectChanges();
               expect(main.debugElement.nativeElement).toHaveText('SIMPLE(A)');
               async.done();
             });
       }));


    it('should support projecting text interpolation to a non bound element with other bound elements after it',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(
                Simple, new ViewMetadata({
                  template:
                      'SIMPLE(<div><ng-content></ng-content></div><div [tab-index]="0">EL</div>)',
                  directives: []
                }))
             .overrideView(
                 MainComp,
                 new ViewMetadata({template: '<simple>{{text}}</simple>', directives: [Simple]}))
             .createAsync(MainComp)
             .then((main) => {

               main.debugElement.componentInstance.text = 'A';
               main.detectChanges();
               expect(main.debugElement.nativeElement).toHaveText('SIMPLE(AEL)');
               async.done();
             });
       }));

    it('should not show the light dom even if there is no content tag',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp,
                          new ViewMetadata({template: '<empty>A</empty>', directives: [Empty]}))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.debugElement.nativeElement).toHaveText('');
               async.done();
             });
       }));

    it('should support multiple content tags',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<multiple-content-tags>' +
                                          '<div>B</div>' +
                                          '<div>C</div>' +
                                          '<div class="left">A</div>' +
                                          '</multiple-content-tags>',
                            directives: [MultipleContentTagsComponent]
                          }))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.debugElement.nativeElement).toHaveText('(A, BC)');
               async.done();
             });
       }));

    it('should redistribute only direct children',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<multiple-content-tags>' +
                                          '<div>B<div class="left">A</div></div>' +
                                          '<div>C</div>' +
                                          '</multiple-content-tags>',
                            directives: [MultipleContentTagsComponent]
                          }))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.debugElement.nativeElement).toHaveText('(, BAC)');
               async.done();
             });
       }));

    it("should redistribute direct child viewcontainers when the light dom changes",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<multiple-content-tags>' +
                                          '<template manual class="left"><div>A1</div></template>' +
                                          '<div>B</div>' +
                                          '</multiple-content-tags>',
                            directives: [MultipleContentTagsComponent, ManualViewportDirective]
                          }))
             .createAsync(MainComp)
             .then((main) => {

               var viewportDirectives =
                   main.debugElement.queryAll(By.directive(ManualViewportDirective))
                       .map(de => de.inject(ManualViewportDirective));

               expect(main.debugElement.nativeElement).toHaveText('(, B)');
               viewportDirectives.forEach(d => d.show());
               expect(main.debugElement.nativeElement).toHaveText('(A1, B)');

               viewportDirectives.forEach(d => d.hide());

               expect(main.debugElement.nativeElement).toHaveText('(, B)');
               async.done();
             });
       }));

    it("should support nested components",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<outer-with-indirect-nested>' +
                                          '<div>A</div>' +
                                          '<div>B</div>' +
                                          '</outer-with-indirect-nested>',
                            directives: [OuterWithIndirectNestedComponent]
                          }))
             .createAsync(MainComp)
             .then((main) => {

               expect(main.debugElement.nativeElement).toHaveText('OUTER(SIMPLE(AB))');
               async.done();
             });
       }));

    it("should support nesting with content being direct child of a nested component",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<outer>' +
                                          '<template manual class="left"><div>A</div></template>' +
                                          '<div>B</div>' +
                                          '<div>C</div>' +
                                          '</outer>',
                            directives: [OuterComponent, ManualViewportDirective],
                          }))
             .createAsync(MainComp)
             .then((main) => {

               var viewportDirective =
                   main.debugElement.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);

               expect(main.debugElement.nativeElement).toHaveText('OUTER(INNER(INNERINNER(,BC)))');
               viewportDirective.show();

               expect(main.debugElement.nativeElement).toHaveText('OUTER(INNER(INNERINNER(A,BC)))');
               async.done();
             });
       }));

    it('should redistribute when the shadow dom changes',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<conditional-content>' +
                                          '<div class="left">A</div>' +
                                          '<div>B</div>' +
                                          '<div>C</div>' +
                                          '</conditional-content>',
                            directives: [ConditionalContentComponent]
                          }))
             .createAsync(MainComp)
             .then((main) => {

               var viewportDirective =
                   main.debugElement.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);

               expect(main.debugElement.nativeElement).toHaveText('(, BC)');

               viewportDirective.show();
               expect(main.debugElement.nativeElement).toHaveText('(A, BC)');

               viewportDirective.hide();

               expect(main.debugElement.nativeElement).toHaveText('(, BC)');
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
                new ViewMetadata(
                    {template: '<simple string-prop="text"></simple>', directives: [Simple]}))
             .overrideTemplate(Simple, '<ng-content></ng-content><p>P,</p>{{stringProp}}')
             .createAsync(MainComp)
             .then((main: RootTestComponent) => {

               main.detectChanges();

               expect(main.debugElement.nativeElement).toHaveText('P,text');
               async.done();
             });

       }));

    // important as we are moving style tags around during compilation,
    // which could skrew up text node indices.
    it('should support text nodes after style tags',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.overrideView(
                MainComp,
                new ViewMetadata(
                    {template: '<simple string-prop="text"></simple>', directives: [Simple]}))
             .overrideTemplate(Simple, '<style></style><p>P,</p>{{stringProp}}')
             .createAsync(MainComp)
             .then((main: RootTestComponent) => {

               main.detectChanges();
               expect(main.debugElement.nativeElement).toHaveText('P,text');
               async.done();
             });
       }));

    it('should support moving non projected light dom around',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<empty>' +
                                          '  <template manual><div>A</div></template>' +
                                          '</empty>' +
                                          'START(<div project></div>)END',
                            directives: [Empty, ProjectDirective, ManualViewportDirective],
                          }))
             .createAsync(MainComp)
             .then((main) => {

               var sourceDirective: ManualViewportDirective =
                   main.debugElement.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               var projectDirective: ProjectDirective =
                   main.debugElement.query(By.directive(ProjectDirective)).inject(ProjectDirective);
               expect(main.debugElement.nativeElement).toHaveText('START()END');

               projectDirective.show(sourceDirective.templateRef);
               expect(main.debugElement.nativeElement).toHaveText('START(A)END');
               async.done();
             });
       }));

    it('should support moving projected light dom around',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: '<simple><template manual><div>A</div></template></simple>' +
                                          'START(<div project></div>)END',
                            directives: [Simple, ProjectDirective, ManualViewportDirective],
                          }))
             .createAsync(MainComp)
             .then((main) => {

               var sourceDirective: ManualViewportDirective =
                   main.debugElement.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               var projectDirective: ProjectDirective =
                   main.debugElement.query(By.directive(ProjectDirective)).inject(ProjectDirective);
               expect(main.debugElement.nativeElement).toHaveText('SIMPLE()START()END');

               projectDirective.show(sourceDirective.templateRef);
               expect(main.debugElement.nativeElement).toHaveText('SIMPLE()START(A)END');
               async.done();
             });
       }));

    it('should support moving ng-content around',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(
                MainComp, new ViewMetadata({
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
                   main.debugElement.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               var projectDirective: ProjectDirective =
                   main.debugElement.query(By.directive(ProjectDirective)).inject(ProjectDirective);
               expect(main.debugElement.nativeElement).toHaveText('(, B)START()END');

               projectDirective.show(sourceDirective.templateRef);
               expect(main.debugElement.nativeElement).toHaveText('(, B)START(A)END');

               // Stamping ng-content multiple times should not produce the content multiple
               // times...
               projectDirective.show(sourceDirective.templateRef);
               expect(main.debugElement.nativeElement).toHaveText('(, B)START(A)END');
               async.done();
             });
       }));


    // Note: This does not use a ng-content element, but
    // is still important as we are merging proto views independent of
    // the presence of ng-content elements!
    it('should still allow to implement a recursive trees',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp,
                          new ViewMetadata({template: '<tree></tree>', directives: [Tree]}))
             .createAsync(MainComp)
             .then((main) => {

               main.detectChanges();
               var manualDirective: ManualViewportDirective =
                   main.debugElement.query(By.directive(ManualViewportDirective))
                       .inject(ManualViewportDirective);
               expect(main.debugElement.nativeElement).toHaveText('TREE(0:)');
               manualDirective.show();
               main.detectChanges();
               expect(main.debugElement.nativeElement).toHaveText('TREE(0:TREE(1:))');
               async.done();
             });
       }));

    if (DOM.supportsNativeShadowDOM()) {
      it('should support native content projection and isolate styles per component',
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           tcb.overrideView(MainComp, new ViewMetadata({
                              template: '<simple-native1><div>A</div></simple-native1>' +
                                            '<simple-native2><div>B</div></simple-native2>',
                              directives: [SimpleNative1, SimpleNative2]
                            }))
               .createAsync(MainComp)
               .then((main) => {
                 var childNodes = DOM.childNodes(main.debugElement.nativeElement);
                 expect(childNodes[0]).toHaveText('div {color: red}SIMPLE1(A)');
                 expect(childNodes[1]).toHaveText('div {color: blue}SIMPLE2(B)');
                 async.done();
               });
         }));
    }

    it('should support nested conditionals that contain ng-contents',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(MainComp, new ViewMetadata({
                            template: `<conditional-text>a</conditional-text>`,
                            directives: [ConditionalTextComponent]
                          }))
             .createAsync(MainComp)
             .then((main) => {
               expect(main.debugElement.nativeElement).toHaveText('MAIN()');

               var viewportElement =
                   main.debugElement.componentViewChildren[0].componentViewChildren[0];
               viewportElement.inject(ManualViewportDirective).show();
               expect(main.debugElement.nativeElement).toHaveText('MAIN(FIRST())');

               viewportElement =
                   main.debugElement.componentViewChildren[0].componentViewChildren[1];
               viewportElement.inject(ManualViewportDirective).show();
               expect(main.debugElement.nativeElement).toHaveText('MAIN(FIRST(SECOND(a)))');

               async.done();
             });
       }));

  });
}

@Component({selector: 'main'})
@View({template: '', directives: []})
class MainComp {
  text: string = '';
}

@Component({selector: 'simple', inputs: ['stringProp']})
@View({template: 'SIMPLE(<ng-content></ng-content>)', directives: []})
class Simple {
  stringProp: string = '';
}

@Component({selector: 'simple-native1'})
@View({
  template: 'SIMPLE1(<content></content>)',
  directives: [],
  encapsulation: ViewEncapsulation.Native,
  styles: ['div {color: red}']
})
class SimpleNative1 {
}

@Component({selector: 'simple-native2'})
@View({
  template: 'SIMPLE2(<content></content>)',
  directives: [],
  encapsulation: ViewEncapsulation.Native,
  styles: ['div {color: blue}']
})
class SimpleNative2 {
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
  template:
      'OUTER(<inner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></inner>)',
  directives: [forwardRef(() => InnerComponent)]
})
class OuterComponent {
}

@Component({selector: 'inner'})
@View({
  template:
      'INNER(<innerinner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></innerinner>)',
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

@Component({selector: 'conditional-text'})
@View({
  template:
      'MAIN(<template manual>FIRST(<template manual>SECOND(<ng-content></ng-content>)</template>)</template>)',
  directives: [ManualViewportDirective]
})
class ConditionalTextComponent {
}

@Component({selector: 'tab'})
@View({
  template: '<div><div *manual>TAB(<ng-content></ng-content>)</div></div>',
  directives: [ManualViewportDirective]
})
class Tab {
}

@Component({selector: 'tree', inputs: ['depth']})
@View({
  template: 'TREE({{depth}}:<tree *manual [depth]="depth+1"></tree>)',
  directives: [ManualViewportDirective, Tree]
})
class Tree {
  depth = 0;
}
