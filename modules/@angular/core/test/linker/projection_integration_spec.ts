/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ElementRef, TemplateRef, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {getAllDebugNodes} from '@angular/core/src/debug/debug_node';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, it} from '@angular/core/testing/testing_internal';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('projection', () => {
    beforeEach(() => TestBed.configureTestingModule({declarations: [MainComp, OtherComp, Simple]}));

    it('should support simple components', () => {
      const template = '<simple><div>A</div></simple>';
      TestBed.overrideComponent(MainComp, {set: {template}});
      const main = TestBed.createComponent(MainComp);

      expect(main.nativeElement).toHaveText('SIMPLE(A)');
    });

    it('should support simple components with text interpolation as direct children', () => {
      const template = '{{\'START(\'}}<simple>' +
          '{{text}}' +
          '</simple>{{\')END\'}}';
      TestBed.overrideComponent(MainComp, {set: {template}});
      const main = TestBed.createComponent(MainComp);

      main.componentInstance.text = 'A';
      main.detectChanges();
      expect(main.nativeElement).toHaveText('START(SIMPLE(A))END');
    });

    it('should support projecting text interpolation to a non bound element', () => {
      TestBed.overrideComponent(
          Simple, {set: {template: 'SIMPLE(<div><ng-content></ng-content></div>)'}});
      TestBed.overrideComponent(MainComp, {set: {template: '<simple>{{text}}</simple>'}});
      const main = TestBed.createComponent(MainComp);

      main.componentInstance.text = 'A';
      main.detectChanges();
      expect(main.nativeElement).toHaveText('SIMPLE(A)');
    });

    it('should support projecting text interpolation to a non bound element with other bound elements after it',
       () => {
         TestBed.overrideComponent(Simple, {
           set: {
             template: 'SIMPLE(<div><ng-content></ng-content></div><div [tabIndex]="0">EL</div>)'
           }
         });
         TestBed.overrideComponent(MainComp, {set: {template: '<simple>{{text}}</simple>'}});
         const main = TestBed.createComponent(MainComp);

         main.componentInstance.text = 'A';
         main.detectChanges();
         expect(main.nativeElement).toHaveText('SIMPLE(AEL)');
       });

    it('should project content components', () => {
      TestBed.overrideComponent(
          Simple, {set: {template: 'SIMPLE({{0}}|<ng-content></ng-content>|{{2}})'}});
      TestBed.overrideComponent(OtherComp, {set: {template: '{{1}}'}});
      TestBed.overrideComponent(MainComp, {set: {template: '<simple><other></other></simple>'}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();
      expect(main.nativeElement).toHaveText('SIMPLE(0|1|2)');
    });

    it('should not show the light dom even if there is no content tag', () => {
      TestBed.configureTestingModule({declarations: [Empty]});
      TestBed.overrideComponent(MainComp, {set: {template: '<empty>A</empty>'}});
      const main = TestBed.createComponent(MainComp);

      expect(main.nativeElement).toHaveText('');
    });

    it('should support multiple content tags', () => {
      TestBed.configureTestingModule({declarations: [MultipleContentTagsComponent]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<multiple-content-tags>' +
              '<div>B</div>' +
              '<div>C</div>' +
              '<div class="left">A</div>' +
              '</multiple-content-tags>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      expect(main.nativeElement).toHaveText('(A, BC)');
    });

    it('should redistribute only direct children', () => {
      TestBed.configureTestingModule({declarations: [MultipleContentTagsComponent]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<multiple-content-tags>' +
              '<div>B<div class="left">A</div></div>' +
              '<div>C</div>' +
              '</multiple-content-tags>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      expect(main.nativeElement).toHaveText('(, BAC)');
    });

    it('should redistribute direct child viewcontainers when the light dom changes', () => {
      TestBed.configureTestingModule(
          {declarations: [MultipleContentTagsComponent, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<multiple-content-tags>' +
              '<template manual class="left"><div>A1</div></template>' +
              '<div>B</div>' +
              '</multiple-content-tags>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var viewportDirectives = main.debugElement.children[0]
                                   .childNodes.filter(By.directive(ManualViewportDirective))
                                   .map(de => de.injector.get(ManualViewportDirective));

      expect(main.nativeElement).toHaveText('(, B)');
      viewportDirectives.forEach(d => d.show());
      expect(main.nativeElement).toHaveText('(A1, B)');

      viewportDirectives.forEach(d => d.hide());

      expect(main.nativeElement).toHaveText('(, B)');
    });

    it('should support nested components', () => {
      TestBed.configureTestingModule({declarations: [OuterWithIndirectNestedComponent]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<outer-with-indirect-nested>' +
              '<div>A</div>' +
              '<div>B</div>' +
              '</outer-with-indirect-nested>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      expect(main.nativeElement).toHaveText('OUTER(SIMPLE(AB))');
    });

    it('should support nesting with content being direct child of a nested component', () => {
      TestBed.configureTestingModule({
        declarations:
            [InnerComponent, InnerInnerComponent, OuterComponent, ManualViewportDirective]
      });
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<outer>' +
              '<template manual class="left"><div>A</div></template>' +
              '<div>B</div>' +
              '<div>C</div>' +
              '</outer>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var viewportDirective =
          main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
              ManualViewportDirective);

      expect(main.nativeElement).toHaveText('OUTER(INNER(INNERINNER(,BC)))');
      viewportDirective.show();

      expect(main.nativeElement).toHaveText('OUTER(INNER(INNERINNER(A,BC)))');
    });

    it('should redistribute when the shadow dom changes', () => {
      TestBed.configureTestingModule(
          {declarations: [ConditionalContentComponent, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<conditional-content>' +
              '<div class="left">A</div>' +
              '<div>B</div>' +
              '<div>C</div>' +
              '</conditional-content>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var viewportDirective =
          main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
              ManualViewportDirective);

      expect(main.nativeElement).toHaveText('(, BC)');

      viewportDirective.show();
      expect(main.nativeElement).toHaveText('(A, BC)');

      viewportDirective.hide();

      expect(main.nativeElement).toHaveText('(, BC)');
    });

    // GH-2095 - https://github.com/angular/angular/issues/2095
    // important as we are removing the ng-content element during compilation,
    // which could skrew up text node indices.
    it('should support text nodes after content tags', () => {
      TestBed.overrideComponent(MainComp, {set: {template: '<simple stringProp="text"></simple>'}});
      TestBed.overrideComponent(
          Simple, {set: {template: '<ng-content></ng-content><p>P,</p>{{stringProp}}'}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();

      expect(main.nativeElement).toHaveText('P,text');
    });

    // important as we are moving style tags around during compilation,
    // which could skrew up text node indices.
    it('should support text nodes after style tags', () => {
      TestBed.overrideComponent(MainComp, {set: {template: '<simple stringProp="text"></simple>'}});
      TestBed.overrideComponent(
          Simple, {set: {template: '<style></style><p>P,</p>{{stringProp}}'}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();
      expect(main.nativeElement).toHaveText('P,text');
    });

    it('should support moving non projected light dom around', () => {
      TestBed.configureTestingModule(
          {declarations: [Empty, ProjectDirective, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<empty>' +
              '  <template manual><div>A</div></template>' +
              '</empty>' +
              'START(<div project></div>)END'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var sourceDirective: any;

      // We can't use the child nodes to get a hold of this because it's not in the dom
      // at
      // all.
      getAllDebugNodes().forEach((debug) => {
        if (debug.providerTokens.indexOf(ManualViewportDirective) !== -1) {
          sourceDirective = debug.injector.get(ManualViewportDirective);
        }
      });

      var projectDirective: ProjectDirective =
          main.debugElement.queryAllNodes(By.directive(ProjectDirective))[0].injector.get(
              ProjectDirective);

      expect(main.nativeElement).toHaveText('START()END');

      projectDirective.show(sourceDirective.templateRef);
      expect(main.nativeElement).toHaveText('START(A)END');
    });

    it('should support moving projected light dom around', () => {
      TestBed.configureTestingModule(
          {declarations: [Empty, ProjectDirective, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<simple><template manual><div>A</div></template></simple>' +
              'START(<div project></div>)END'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var sourceDirective: ManualViewportDirective =
          main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
              ManualViewportDirective);
      var projectDirective: ProjectDirective =
          main.debugElement.queryAllNodes(By.directive(ProjectDirective))[0].injector.get(
              ProjectDirective);
      expect(main.nativeElement).toHaveText('SIMPLE()START()END');

      projectDirective.show(sourceDirective.templateRef);
      expect(main.nativeElement).toHaveText('SIMPLE()START(A)END');
    });

    it('should support moving ng-content around', () => {
      TestBed.configureTestingModule(
          {declarations: [ConditionalContentComponent, ProjectDirective, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<conditional-content>' +
              '<div class="left">A</div>' +
              '<div>B</div>' +
              '</conditional-content>' +
              'START(<div project></div>)END'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var sourceDirective: ManualViewportDirective =
          main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
              ManualViewportDirective);
      var projectDirective: ProjectDirective =
          main.debugElement.queryAllNodes(By.directive(ProjectDirective))[0].injector.get(
              ProjectDirective);
      expect(main.nativeElement).toHaveText('(, B)START()END');

      projectDirective.show(sourceDirective.templateRef);
      expect(main.nativeElement).toHaveText('(, B)START(A)END');

      // Stamping ng-content multiple times should not produce the content multiple
      // times...
      projectDirective.show(sourceDirective.templateRef);
      expect(main.nativeElement).toHaveText('(, B)START(A)END');
    });

    // Note: This does not use a ng-content element, but
    // is still important as we are merging proto views independent of
    // the presence of ng-content elements!
    it('should still allow to implement a recursive trees', () => {
      TestBed.configureTestingModule({declarations: [Tree, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {set: {template: '<tree></tree>'}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();
      var manualDirective: ManualViewportDirective =
          main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
              ManualViewportDirective);
      expect(main.nativeElement).toHaveText('TREE(0:)');
      manualDirective.show();
      main.detectChanges();
      expect(main.nativeElement).toHaveText('TREE(0:TREE(1:))');
    });

    // Note: This does not use a ng-content element, but
    // is still important as we are merging proto views independent of
    // the presence of ng-content elements!
    it('should still allow to implement a recursive trees via multiple components', () => {
      TestBed.configureTestingModule({declarations: [Tree, Tree2, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {set: {template: '<tree></tree>'}});
      TestBed.overrideComponent(
          Tree, {set: {template: 'TREE({{depth}}:<tree2 *manual [depth]="depth+1"></tree2>)'}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();

      expect(main.nativeElement).toHaveText('TREE(0:)');

      var tree = main.debugElement.query(By.directive(Tree));
      var manualDirective: ManualViewportDirective = tree.queryAllNodes(By.directive(
          ManualViewportDirective))[0].injector.get(ManualViewportDirective);
      manualDirective.show();
      main.detectChanges();
      expect(main.nativeElement).toHaveText('TREE(0:TREE2(1:))');

      var tree2 = main.debugElement.query(By.directive(Tree2));
      manualDirective = tree2.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
          ManualViewportDirective);
      manualDirective.show();
      main.detectChanges();
      expect(main.nativeElement).toHaveText('TREE(0:TREE2(1:TREE(2:)))');
    });

    if (getDOM().supportsNativeShadowDOM()) {
      it('should support native content projection and isolate styles per component', () => {
        TestBed.configureTestingModule({declarations: [SimpleNative1, SimpleNative2]});
        TestBed.overrideComponent(MainComp, {
          set: {
            template: '<simple-native1><div>A</div></simple-native1>' +
                '<simple-native2><div>B</div></simple-native2>'
          }
        });
        const main = TestBed.createComponent(MainComp);

        var childNodes = getDOM().childNodes(main.nativeElement);
        expect(childNodes[0]).toHaveText('div {color: red}SIMPLE1(A)');
        expect(childNodes[1]).toHaveText('div {color: blue}SIMPLE2(B)');
        main.destroy();
      });
    }

    if (getDOM().supportsDOMEvents()) {
      it('should support non emulated styles', () => {
        TestBed.configureTestingModule({declarations: [OtherComp]});
        TestBed.overrideComponent(MainComp, {
          set: {
            template: '<div class="redStyle"></div>',
            styles: ['.redStyle { color: red}'],
            encapsulation: ViewEncapsulation.None,
          }
        });
        const main = TestBed.createComponent(MainComp);

        var mainEl = main.nativeElement;
        var div1 = getDOM().firstChild(mainEl);
        var div2 = getDOM().createElement('div');
        getDOM().setAttribute(div2, 'class', 'redStyle');
        getDOM().appendChild(mainEl, div2);
        expect(getDOM().getComputedStyle(div1).color).toEqual('rgb(255, 0, 0)');
        expect(getDOM().getComputedStyle(div2).color).toEqual('rgb(255, 0, 0)');
      });

      it('should support emulated style encapsulation', () => {
        TestBed.configureTestingModule({declarations: [OtherComp]});
        TestBed.overrideComponent(MainComp, {
          set: {
            template: '<div></div>',
            styles: ['div { color: red}'],
            encapsulation: ViewEncapsulation.Emulated,
          }
        });
        const main = TestBed.createComponent(MainComp);

        var mainEl = main.nativeElement;
        var div1 = getDOM().firstChild(mainEl);
        var div2 = getDOM().createElement('div');
        getDOM().appendChild(mainEl, div2);
        expect(getDOM().getComputedStyle(div1).color).toEqual('rgb(255, 0, 0)');
        expect(getDOM().getComputedStyle(div2).color).toEqual('rgb(0, 0, 0)');
      });
    }

    it('should support nested conditionals that contain ng-contents', () => {
      TestBed.configureTestingModule(
          {declarations: [ConditionalTextComponent, ManualViewportDirective]});
      TestBed.overrideComponent(
          MainComp, {set: {template: `<conditional-text>a</conditional-text>`}});
      const main = TestBed.createComponent(MainComp);

      expect(main.nativeElement).toHaveText('MAIN()');

      var viewportElement =
          main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0];
      viewportElement.injector.get(ManualViewportDirective).show();
      expect(main.nativeElement).toHaveText('MAIN(FIRST())');

      viewportElement = main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[1];
      viewportElement.injector.get(ManualViewportDirective).show();
      expect(main.nativeElement).toHaveText('MAIN(FIRST(SECOND(a)))');
    });

    it('should allow to switch the order of nested components via ng-content', () => {
      TestBed.configureTestingModule({declarations: [CmpA, CmpB, CmpD, CmpC]});
      TestBed.overrideComponent(MainComp, {set: {template: `<cmp-a><cmp-b></cmp-b></cmp-a>`}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();
      expect(getDOM().getInnerHTML(main.nativeElement))
          .toEqual(
              '<cmp-a><cmp-b><cmp-d><i>cmp-d</i></cmp-d></cmp-b>' +
              '<cmp-c><b>cmp-c</b></cmp-c></cmp-a>');
    });

    it('should create nested components in the right order', () => {
      TestBed.configureTestingModule(
          {declarations: [CmpA1, CmpA2, CmpB11, CmpB12, CmpB21, CmpB22]});
      TestBed.overrideComponent(MainComp, {set: {template: `<cmp-a1></cmp-a1><cmp-a2></cmp-a2>`}});
      const main = TestBed.createComponent(MainComp);

      main.detectChanges();
      expect(getDOM().getInnerHTML(main.nativeElement))
          .toEqual(
              '<cmp-a1>a1<cmp-b11>b11</cmp-b11><cmp-b12>b12</cmp-b12></cmp-a1>' +
              '<cmp-a2>a2<cmp-b21>b21</cmp-b21><cmp-b22>b22</cmp-b22></cmp-a2>');
    });

    it('should project filled view containers into a view container', () => {
      TestBed.configureTestingModule(
          {declarations: [ConditionalContentComponent, ManualViewportDirective]});
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<conditional-content>' +
              '<div class="left">A</div>' +
              '<template manual class="left">B</template>' +
              '<div class="left">C</div>' +
              '<div>D</div>' +
              '</conditional-content>'
        }
      });
      const main = TestBed.createComponent(MainComp);

      var conditionalComp = main.debugElement.query(By.directive(ConditionalContentComponent));

      var viewViewportDir =
          conditionalComp.queryAllNodes(By.directive(ManualViewportDirective))[0].injector.get(
              ManualViewportDirective);

      expect(main.nativeElement).toHaveText('(, D)');
      expect(main.nativeElement).toHaveText('(, D)');

      viewViewportDir.show();

      expect(main.nativeElement).toHaveText('(AC, D)');

      var contentViewportDir =
          conditionalComp.queryAllNodes(By.directive(ManualViewportDirective))[1].injector.get(
              ManualViewportDirective);

      contentViewportDir.show();

      expect(main.nativeElement).toHaveText('(ABC, D)');

      // hide view viewport, and test that it also hides
      // the content viewport's views
      viewViewportDir.hide();
      expect(main.nativeElement).toHaveText('(, D)');
    });
  });
}

@Component({selector: 'main', template: ''})
class MainComp {
  text: string = '';
}

@Component({selector: 'other', template: ''})
class OtherComp {
  text: string = '';
}

@Component({
  selector: 'simple',
  inputs: ['stringProp'],
  template: 'SIMPLE(<ng-content></ng-content>)',
})
class Simple {
  stringProp: string = '';
}

@Component({
  selector: 'simple-native1',
  template: 'SIMPLE1(<content></content>)',
  encapsulation: ViewEncapsulation.Native,
  styles: ['div {color: red}']
})
class SimpleNative1 {
}

@Component({
  selector: 'simple-native2',
  template: 'SIMPLE2(<content></content>)',
  encapsulation: ViewEncapsulation.Native,
  styles: ['div {color: blue}']
})
class SimpleNative2 {
}

@Component({selector: 'empty', template: ''})
class Empty {
}

@Component({
  selector: 'multiple-content-tags',
  template: '(<ng-content SELECT=".left"></ng-content>, <ng-content></ng-content>)',
})
class MultipleContentTagsComponent {
}

@Directive({selector: '[manual]'})
class ManualViewportDirective {
  constructor(public vc: ViewContainerRef, public templateRef: TemplateRef<Object>) {}
  show() { this.vc.createEmbeddedView(this.templateRef); }
  hide() { this.vc.clear(); }
}

@Directive({selector: '[project]'})
class ProjectDirective {
  constructor(public vc: ViewContainerRef) {}
  show(templateRef: TemplateRef<Object>) { this.vc.createEmbeddedView(templateRef); }
  hide() { this.vc.clear(); }
}

@Component({
  selector: 'outer-with-indirect-nested',
  template: 'OUTER(<simple><div><ng-content></ng-content></div></simple>)',
})
class OuterWithIndirectNestedComponent {
}

@Component({
  selector: 'outer',
  template:
      'OUTER(<inner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></inner>)',
})
class OuterComponent {
}

@Component({
  selector: 'inner',
  template:
      'INNER(<innerinner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></innerinner>)',
})
class InnerComponent {
}

@Component({
  selector: 'innerinner',
  template: 'INNERINNER(<ng-content select=".left"></ng-content>,<ng-content></ng-content>)',
})
class InnerInnerComponent {
}

@Component({
  selector: 'conditional-content',
  template:
      '<div>(<div *manual><ng-content select=".left"></ng-content></div>, <ng-content></ng-content>)</div>',
})
class ConditionalContentComponent {
}

@Component({
  selector: 'conditional-text',
  template:
      'MAIN(<template manual>FIRST(<template manual>SECOND(<ng-content></ng-content>)</template>)</template>)',
})
class ConditionalTextComponent {
}

@Component({
  selector: 'tab',
  template: '<div><div *manual>TAB(<ng-content></ng-content>)</div></div>',
})
class Tab {
}

@Component({
  selector: 'tree2',
  inputs: ['depth'],
  template: 'TREE2({{depth}}:<tree *manual [depth]="depth+1"></tree>)',
})
class Tree2 {
  depth = 0;
}

@Component({
  selector: 'tree',
  inputs: ['depth'],
  template: 'TREE({{depth}}:<tree *manual [depth]="depth+1"></tree>)',
})
class Tree {
  depth = 0;
}


@Component({selector: 'cmp-d', template: `<i>{{tagName}}</i>`})
class CmpD {
  tagName: string;
  constructor(elementRef: ElementRef) {
    this.tagName = getDOM().tagName(elementRef.nativeElement).toLowerCase();
  }
}


@Component({selector: 'cmp-c', template: `<b>{{tagName}}</b>`})
class CmpC {
  tagName: string;
  constructor(elementRef: ElementRef) {
    this.tagName = getDOM().tagName(elementRef.nativeElement).toLowerCase();
  }
}


@Component({selector: 'cmp-b', template: `<ng-content></ng-content><cmp-d></cmp-d>`})
class CmpB {
}


@Component({selector: 'cmp-a', template: `<ng-content></ng-content><cmp-c></cmp-c>`})
class CmpA {
}

@Component({selector: 'cmp-b11', template: `{{'b11'}}`})
class CmpB11 {
}

@Component({selector: 'cmp-b12', template: `{{'b12'}}`})
class CmpB12 {
}

@Component({selector: 'cmp-b21', template: `{{'b21'}}`})
class CmpB21 {
}

@Component({selector: 'cmp-b22', template: `{{'b22'}}`})
class CmpB22 {
}

@Component({
  selector: 'cmp-a1',
  template: `{{'a1'}}<cmp-b11></cmp-b11><cmp-b12></cmp-b12>`,
})
class CmpA1 {
}

@Component({
  selector: 'cmp-a2',
  template: `{{'a2'}}<cmp-b21></cmp-b21><cmp-b22></cmp-b22>`,
})
class CmpA2 {
}
