/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM, CommonModule} from '@angular/common';
import {By} from '@angular/platform-browser';
import {isNode} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Injector,
  Input,
  OnInit,
  reflectComponentType,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  forwardRef,
} from '../../src/core';
import {ComponentFixture, TestBed} from '../../testing';

describe('projection', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should support simple components', () => {
    const template = '<simple><div>A</div></simple>';
    TestBed.overrideComponent(MainComp, {set: {template}});
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('SIMPLE(A)');
  });

  it('should support simple components with text interpolation as direct children', () => {
    const template = "{{'START('}}<simple>" + '{{text}}' + "</simple>{{')END'}}";
    TestBed.overrideComponent(MainComp, {set: {template}});
    const main = TestBed.createComponent(MainComp);

    main.componentInstance.text = 'A';
    main.detectChanges();
    expect(main.nativeElement).toHaveText('START(SIMPLE(A))END');
  });

  it('should support projecting text interpolation to a non bound element', () => {
    TestBed.overrideComponent(Simple, {
      set: {template: 'SIMPLE(<div><ng-content></ng-content></div>)'},
    });
    TestBed.overrideComponent(MainComp, {set: {template: '<simple>{{text}}</simple>'}});
    const main = TestBed.createComponent(MainComp);

    main.componentInstance.text = 'A';
    main.detectChanges();
    expect(main.nativeElement).toHaveText('SIMPLE(A)');
  });

  it('should support projecting text interpolation to a non bound element with other bound elements after it', () => {
    TestBed.overrideComponent(Simple, {
      set: {template: 'SIMPLE(<div><ng-content></ng-content></div><div [tabIndex]="0">EL</div>)'},
    });
    TestBed.overrideComponent(MainComp, {set: {template: '<simple>{{text}}</simple>'}});
    const main = TestBed.createComponent(MainComp);

    main.componentInstance.text = 'A';
    main.detectChanges();
    expect(main.nativeElement).toHaveText('SIMPLE(AEL)');
  });

  it('should project content components', () => {
    TestBed.overrideComponent(Simple, {
      set: {template: 'SIMPLE({{0}}|<ng-content></ng-content>|{{2}})'},
    });
    TestBed.overrideComponent(OtherComp, {set: {template: '{{1}}'}});
    TestBed.overrideComponent(MainComp, {set: {template: '<simple><other></other></simple>'}});
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    expect(main.nativeElement).toHaveText('SIMPLE(0|1|2)');
  });

  it('should not show the light dom even if there is no content tag', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template: '<empty>A</empty>',
        imports: [forwardRef(() => OtherComp), forwardRef(() => Simple), forwardRef(() => Empty)],
      },
    });
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('');
  });

  it('should project a single class-based tag', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<single-content-tag>' +
          '<div class="target">I AM PROJECTED</div>' +
          '</single-content-tag>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => SingleContentTagComponent),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('I AM PROJECTED');
  });

  it('should support multiple content tags', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<multiple-content-tags>' +
          '<div>B</div>' +
          '<div>C</div>' +
          '<div class="left">A</div>' +
          '</multiple-content-tags>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => MultipleContentTagsComponent),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('(A, BC)');
  });

  it('should support passing projectable nodes via factory function', () => {
    @Component({
      selector: 'multiple-content-tags',
      template: '(<ng-content SELECT="h1"></ng-content>, <ng-content></ng-content>)',
    })
    class MultipleContentTagsComponent {}

    const injector: Injector = TestBed.inject(Injector);

    expect(reflectComponentType(MultipleContentTagsComponent)?.ngContentSelectors).toEqual([
      'h1',
      '*',
    ]);

    const nodeOne = getDOM().getDefaultDocument().createTextNode('one');
    const nodeTwo = getDOM().getDefaultDocument().createTextNode('two');
    const component = createComponent(MultipleContentTagsComponent, {
      environmentInjector: injector as EnvironmentInjector,
      projectableNodes: [[nodeOne], [nodeTwo]],
    });
    expect(component.location.nativeElement).toHaveText('(one, two)');
  });

  it('should redistribute only direct children', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<multiple-content-tags>' +
          '<div>B<div class="left">A</div></div>' +
          '<div>C</div>' +
          '</multiple-content-tags>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => MultipleContentTagsComponent),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('(, BAC)');
  });

  it('should redistribute direct child viewcontainers when the light dom changes', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<multiple-content-tags>' +
          '<ng-template manual class="left"><div>A1</div></ng-template>' +
          '<div>B</div>' +
          '</multiple-content-tags>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => MultipleContentTagsComponent),
          forwardRef(() => ManualViewportDirective),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const viewportDirectives = main.debugElement.children[0].childNodes
      .filter(By.directive(ManualViewportDirective))
      .map((de) => de.injector.get(ManualViewportDirective));

    expect(main.nativeElement).toHaveText('(, B)');

    viewportDirectives.forEach((d) => d.show());
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(A1, B)');

    viewportDirectives.forEach((d) => d.hide());
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(, B)');
  });

  it('should support nested components', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<outer-with-indirect-nested>' +
          '<div>A</div>' +
          '<div>B</div>' +
          '</outer-with-indirect-nested>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => OuterWithIndirectNestedComponent),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('OUTER(SIMPLE(AB))');
  });

  it('should support nesting with content being direct child of a nested component', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<outer>' +
          '<ng-template manual class="left"><div>A</div></ng-template>' +
          '<div>B</div>' +
          '<div>C</div>' +
          '</outer>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => OuterComponent),
          forwardRef(() => ManualViewportDirective),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const viewportDirective = main.debugElement
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);

    expect(main.nativeElement).toHaveText('OUTER(INNER(INNERINNER(,BC)))');
    viewportDirective.show();

    expect(main.nativeElement).toHaveText('OUTER(INNER(INNERINNER(A,BC)))');
  });

  it('should redistribute when the shadow dom changes', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<conditional-content>' +
          '<div class="left">A</div>' +
          '<div>B</div>' +
          '<div>C</div>' +
          '</conditional-content>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => ConditionalContentComponent),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const viewportDirective = main.debugElement
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);

    expect(main.nativeElement).toHaveText('(, BC)');

    viewportDirective.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(A, BC)');

    viewportDirective.hide();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(, BC)');
  });

  it('should redistribute non-continuous blocks of nodes when the shadow dom changes', () => {
    @Component({
      selector: 'child',
      template: `<ng-content></ng-content>(<ng-template [ngIf]="showing"
          ><ng-content select="div"></ng-content></ng-template
        >)`,

      changeDetection: ChangeDetectionStrategy.Eager,
      imports: [CommonModule],
    })
    class Child {
      @Input() showing!: boolean;
    }

    @Component({
      template: `<child [showing]="showing">
        <div>A</div>
        <span>B</span>
        <div>A</div>
        <span>B</span>
      </child>`,

      changeDetection: ChangeDetectionStrategy.Eager,
      imports: [Child],
    })
    class App {
      showing = false;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('BB()');

    fixture.componentInstance.showing = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('BB(AA)');

    fixture.componentInstance.showing = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('BB()');
  });

  // GH-2095 - https://github.com/angular/angular/issues/2095
  // important as we are removing the ng-content element during compilation,
  // which could skrew up text node indices.
  it('should support text nodes after content tags', () => {
    TestBed.overrideComponent(MainComp, {set: {template: '<simple stringProp="text"></simple>'}});
    TestBed.overrideComponent(Simple, {
      set: {template: '<ng-content></ng-content><p>P,</p>{{stringProp}}'},
    });
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();

    expect(main.nativeElement).toHaveText('P,text');
  });

  // important as we are moving style tags around during compilation,
  // which could skrew up text node indices.
  it('should support text nodes after style tags', () => {
    TestBed.overrideComponent(MainComp, {set: {template: '<simple stringProp="text"></simple>'}});
    TestBed.overrideComponent(Simple, {set: {template: '<style></style><p>P,</p>{{stringProp}}'}});
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    expect(main.nativeElement).toHaveText('P,text');
  });

  it('should support moving non projected light dom around', () => {
    let sourceDirective: ManualViewportDirective = undefined!;

    @Directive({
      selector: '[manual]',
    })
    class ManualViewportDirective {
      constructor(public templateRef: TemplateRef<Object>) {
        sourceDirective = this;
      }
    }

    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<empty>' +
          ' <ng-template manual><div>A</div></ng-template>' +
          '</empty>' +
          'START(<div project></div>)END',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => Empty),
          forwardRef(() => ProjectDirective),
          ManualViewportDirective,
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const projectDirective: ProjectDirective = main.debugElement
      .queryAllNodes(By.directive(ProjectDirective))[0]
      .injector.get(ProjectDirective);

    expect(main.nativeElement).toHaveText('START()END');

    projectDirective.show(sourceDirective.templateRef);
    expect(main.nativeElement).toHaveText('START(A)END');
  });

  it('should support moving projected light dom around', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<simple><ng-template manual><div>A</div></ng-template></simple>' +
          'START(<div project></div>)END',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => ProjectDirective),
          forwardRef(() => ManualViewportDirective),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const sourceDirective: ManualViewportDirective = main.debugElement
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);
    const projectDirective: ProjectDirective = main.debugElement
      .queryAllNodes(By.directive(ProjectDirective))[0]
      .injector.get(ProjectDirective);
    expect(main.nativeElement).toHaveText('SIMPLE()START()END');

    projectDirective.show(sourceDirective.templateRef);
    expect(main.nativeElement).toHaveText('SIMPLE()START(A)END');
  });

  it('should support moving ng-content around', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<conditional-content>' +
          '<div class="left">A</div>' +
          '<div>B</div>' +
          '</conditional-content>' +
          'START(<div project></div>)END',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => ConditionalContentComponent),
          forwardRef(() => ProjectDirective),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const sourceDirective: ManualViewportDirective = main.debugElement
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);
    const projectDirective: ProjectDirective = main.debugElement
      .queryAllNodes(By.directive(ProjectDirective))[0]
      .injector.get(ProjectDirective);
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
    TestBed.overrideComponent(MainComp, {
      set: {
        template: '<tree></tree>',
        imports: [forwardRef(() => OtherComp), forwardRef(() => Simple), forwardRef(() => Tree)],
      },
    });
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    const manualDirective: ManualViewportDirective = main.debugElement
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);
    expect(main.nativeElement).toHaveText('TREE(0:)');
    manualDirective.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('TREE(0:TREE(1:))');
  });

  // Note: This does not use a ng-content element, but
  // is still important as we are merging proto views independent of
  // the presence of ng-content elements!
  it('should still allow to implement a recursive trees via multiple components', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template: '<tree></tree>',
        imports: [forwardRef(() => OtherComp), forwardRef(() => Simple), forwardRef(() => Tree)],
      },
    });
    TestBed.overrideComponent(Tree, {
      set: {
        template: 'TREE({{depth}}:<tree2 *manual [depth]="depth+1"></tree2>)',
        imports: [forwardRef(() => ManualViewportDirective), forwardRef(() => Tree2)],
      },
    });
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();

    expect(main.nativeElement).toHaveText('TREE(0:)');

    const tree = main.debugElement.query(By.directive(Tree));
    let manualDirective: ManualViewportDirective = tree
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);
    manualDirective.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('TREE(0:TREE2(1:))');

    const tree2 = main.debugElement.query(By.directive(Tree2));
    manualDirective = tree2
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);
    manualDirective.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('TREE(0:TREE2(1:TREE(2:)))');
  });

  if (!isNode) {
    it('should support shadow dom content projection and isolate styles per component', () => {
      TestBed.overrideComponent(MainComp, {
        set: {
          template:
            '<simple-shadow-dom1><div>A</div></simple-shadow-dom1>' +
            '<simple-shadow-dom2><div>B</div></simple-shadow-dom2>',
          imports: [
            forwardRef(() => OtherComp),
            forwardRef(() => Simple),
            forwardRef(() => SimpleShadowDom1),
            forwardRef(() => SimpleShadowDom2),
          ],
        },
      });
      const main = TestBed.createComponent(MainComp);

      const childNodes = main.nativeElement.childNodes;
      expect(childNodes[0]).toHaveText('div {color: red}SIMPLE1(A)');
      expect(childNodes[1]).toHaveText('div {color: blue}SIMPLE2(B)');
      main.destroy();
    });
  }

  if (getDOM().supportsDOMEvents) {
    it('should support non emulated styles', () => {
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<div class="redStyle"></div>',
          styles: ['.redStyle { color: red}'],
          encapsulation: ViewEncapsulation.None,
        },
      });
      const main = TestBed.createComponent(MainComp);

      const mainEl = main.nativeElement;
      const div1 = mainEl.firstChild;
      const div2 = getDOM().createElement('div');
      div2.setAttribute('class', 'redStyle');
      mainEl.appendChild(div2);
      expect(getComputedStyle(div1).color).toEqual('rgb(255, 0, 0)');
      expect(getComputedStyle(div2).color).toEqual('rgb(255, 0, 0)');
    });

    it('should support emulated style encapsulation', () => {
      TestBed.overrideComponent(MainComp, {
        set: {
          template: '<div></div>',
          styles: ['div { color: red}'],
          encapsulation: ViewEncapsulation.Emulated,
        },
      });
      const main = TestBed.createComponent(MainComp);

      const mainEl = main.nativeElement;
      const div1 = mainEl.firstChild;
      const div2 = getDOM().createElement('div');
      mainEl.appendChild(div2);
      expect(getComputedStyle(div1).color).toEqual('rgb(255, 0, 0)');
      expect(getComputedStyle(div2).color).toEqual('rgb(0, 0, 0)');
    });
  }

  it('should support nested conditionals that contain ng-contents', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template: `<conditional-text>a</conditional-text>`,
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => ConditionalTextComponent),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    expect(main.nativeElement).toHaveText('MAIN()');

    let viewportElement = main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0];
    viewportElement.injector.get(ManualViewportDirective).show();
    expect(main.nativeElement).toHaveText('MAIN(FIRST())');

    viewportElement = main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[1];
    viewportElement.injector.get(ManualViewportDirective).show();
    expect(main.nativeElement).toHaveText('MAIN(FIRST(SECOND(a)))');
  });

  it('should allow to switch the order of nested components via ng-content', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template: `<cmp-a><cmp-b></cmp-b></cmp-a>`,
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => CmpA),
          forwardRef(() => CmpB),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    expect(main.nativeElement.innerHTML).toEqual(
      '<cmp-a><cmp-b><cmp-d><i>cmp-d</i></cmp-d></cmp-b>' + '<cmp-c><b>cmp-c</b></cmp-c></cmp-a>',
    );
  });

  it('should create nested components in the right order', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template: `<cmp-a1></cmp-a1><cmp-a2></cmp-a2>`,
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => CmpA1),
          forwardRef(() => CmpA2),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    expect(main.nativeElement.innerHTML).toEqual(
      '<cmp-a1>a1<cmp-b11>b11</cmp-b11><cmp-b12>b12</cmp-b12></cmp-a1>' +
        '<cmp-a2>a2<cmp-b21>b21</cmp-b21><cmp-b22>b22</cmp-b22></cmp-a2>',
    );
  });

  it("should project nodes into nested templates when the main template doesn't have <ng-content>", () => {
    @Component({
      selector: 'content-in-template',
      template: `(<ng-template manual><ng-content select="[id=left]"></ng-content></ng-template>)`,

      imports: [forwardRef(() => ManualViewportDirective)],
    })
    class ContentInATemplateComponent {}

    TestBed.overrideComponent(MainComp, {
      set: {
        template: `<content-in-template><div id="left">A</div></content-in-template>`,
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          ContentInATemplateComponent,
        ],
      },
    });

    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    expect(main.nativeElement).toHaveText('()');

    let viewportElement = main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0];
    viewportElement.injector.get(ManualViewportDirective).show();
    expect(main.nativeElement).toHaveText('(A)');
  });

  it('should project nodes into nested templates and the main template', () => {
    @Component({
      selector: 'content-in-main-and-template',
      template: `<ng-content></ng-content>(<ng-template manual
          ><ng-content select="[id=left]"></ng-content></ng-template
        >)`,

      imports: [forwardRef(() => ManualViewportDirective)],
    })
    class ContentInMainAndTemplateComponent {}

    TestBed.overrideComponent(MainComp, {
      set: {
        template: `<content-in-main-and-template><div id="left">A</div>B</content-in-main-and-template>`,
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          ContentInMainAndTemplateComponent,
        ],
      },
    });

    const main = TestBed.createComponent(MainComp);

    main.detectChanges();
    expect(main.nativeElement).toHaveText('B()');

    let viewportElement = main.debugElement.queryAllNodes(By.directive(ManualViewportDirective))[0];
    viewportElement.injector.get(ManualViewportDirective).show();
    expect(main.nativeElement).toHaveText('B(A)');
  });

  it('should project view containers', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<single-content-tag>' +
          '<div class="target">A</div>' +
          '<ng-template manual class="target">B</ng-template>' +
          '<div class="target">C</div>' +
          '</single-content-tag>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => SingleContentTagComponent),
          forwardRef(() => ManualViewportDirective),
        ],
      },
    });

    const main = TestBed.createComponent(MainComp);
    const manualDirective = main.debugElement
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);

    expect(main.nativeElement).toHaveText('AC');

    manualDirective.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('ABC');
  });

  it('should project filled view containers into a view container', () => {
    TestBed.overrideComponent(MainComp, {
      set: {
        template:
          '<conditional-content>' +
          '<div class="left">A</div>' +
          '<ng-template manual class="left">B</ng-template>' +
          '<div class="left">C</div>' +
          '<div>D</div>' +
          '</conditional-content>',
        imports: [
          forwardRef(() => OtherComp),
          forwardRef(() => Simple),
          forwardRef(() => ConditionalContentComponent),
          forwardRef(() => ManualViewportDirective),
        ],
      },
    });
    const main = TestBed.createComponent(MainComp);

    const conditionalComp = main.debugElement.query(By.directive(ConditionalContentComponent));

    const viewViewportDir = conditionalComp
      .queryAllNodes(By.directive(ManualViewportDirective))[0]
      .injector.get(ManualViewportDirective);

    expect(main.nativeElement).toHaveText('(, D)');
    expect(main.nativeElement).toHaveText('(, D)');

    viewViewportDir.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(AC, D)');

    const contentViewportDir = conditionalComp
      .queryAllNodes(By.directive(ManualViewportDirective))[1]
      .injector.get(ManualViewportDirective);

    contentViewportDir.show();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(ABC, D)');

    // hide view viewport, and test that it also hides
    // the content viewport's views
    viewViewportDir.hide();
    main.detectChanges();
    expect(main.nativeElement).toHaveText('(, D)');
  });

  describe('projectable nodes', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      constructor(public vcr: ViewContainerRef) {}
    }

    @Component({
      template: '',
    })
    class WithContentCmpt {
      @ViewChild('ref', {static: true}) directiveRef: any;
    }

    @Component({
      selector: 're-project',
      template: '<ng-content></ng-content>',
    })
    class ReProjectCmpt {}

    @Directive({
      selector: '[insert]',
    })
    class InsertTplRef implements OnInit {
      constructor(
        private _vcRef: ViewContainerRef,
        private _tplRef: TemplateRef<{}>,
      ) {}

      ngOnInit() {
        this._vcRef.createEmbeddedView(this._tplRef);
      }
    }

    @Directive({
      selector: '[delayedInsert]',
      exportAs: 'delayedInsert',
    })
    class DelayedInsertTplRef {
      constructor(
        public vc: ViewContainerRef,
        public templateRef: TemplateRef<Object>,
      ) {}
      show() {
        this.vc.createEmbeddedView(this.templateRef);
      }
      hide() {
        this.vc.clear();
      }
    }

    let fixture: ComponentFixture<TestComponent>;

    function createCmptInstance(
      tpl: string,
      projectableNodes: any[][],
      components: any[] = [],
    ): ComponentRef<WithContentCmpt> {
      TestBed.overrideTemplate(WithContentCmpt, tpl);
      if (components.length > 0) {
        TestBed.overrideComponent(WithContentCmpt, {add: {imports: components}});
      }

      fixture = TestBed.createComponent(TestComponent);
      const vcr = fixture.componentInstance.vcr;
      const cmptRef = vcr.createComponent(WithContentCmpt, {
        injector: Injector.NULL,
        projectableNodes,
      });

      cmptRef.changeDetectorRef.detectChanges();

      return cmptRef;
    }

    it('should pass nodes to the default ng-content without selectors', () => {
      const cmptRef = createCmptInstance('<div>(<ng-content></ng-content>)</div>', [
        [document.createTextNode('A')],
      ]);
      expect(cmptRef.location.nativeElement).toHaveText('(A)');
    });

    it('should pass nodes to the default ng-content at the root', () => {
      const cmptRef = createCmptInstance('<ng-content></ng-content>', [
        [document.createTextNode('A')],
      ]);
      expect(cmptRef.location.nativeElement).toHaveText('A');
    });

    it('should pass nodes to multiple ng-content tags', () => {
      const cmptRef = createCmptInstance(
        'A:(<ng-content></ng-content>)B:(<ng-content select="b"></ng-content>)C:(<ng-content select="c"></ng-content>)',
        [
          [document.createTextNode('A')],
          [document.createTextNode('B')],
          [document.createTextNode('C')],
        ],
      );
      expect(cmptRef.location.nativeElement).toHaveText('A:(A)B:(B)C:(C)');
    });

    it('should pass nodes to the default ng-content inside ng-container', () => {
      const cmptRef = createCmptInstance(
        'A<ng-container>(<ng-content></ng-content>)</ng-container>C',
        [[document.createTextNode('B')]],
      );
      expect(cmptRef.location.nativeElement).toHaveText('A(B)C');
    });

    it('should pass nodes to the default ng-content inside an embedded view', () => {
      const cmptRef = createCmptInstance(
        'A<ng-template insert>(<ng-content></ng-content>)</ng-template>C',
        [[document.createTextNode('B')]],
        [InsertTplRef],
      );
      expect(cmptRef.location.nativeElement).toHaveText('A(B)C');
    });

    it('should pass nodes to the default ng-content inside a delayed embedded view', () => {
      const cmptRef = createCmptInstance(
        'A(<ng-template #ref="delayedInsert" delayedInsert>[<ng-content></ng-content>]</ng-template>)C',
        [[document.createTextNode('B')]],
        [DelayedInsertTplRef],
      );
      expect(cmptRef.location.nativeElement).toHaveText('A()C');

      const delayedInsert = cmptRef.instance.directiveRef as DelayedInsertTplRef;

      delayedInsert.show();
      cmptRef.changeDetectorRef.detectChanges();
      expect(cmptRef.location.nativeElement).toHaveText('A([B])C');

      delayedInsert.hide();
      cmptRef.changeDetectorRef.detectChanges();
      expect(cmptRef.location.nativeElement).toHaveText('A()C');
    });

    it('should re-project at the root', () => {
      const cmptRef = createCmptInstance(
        'A[<re-project>(<ng-content></ng-content>)</re-project>]C',
        [[document.createTextNode('B')]],
      );
      expect(cmptRef.location.nativeElement).toHaveText('A[(B)]C');
    });
  });
});

@Component({
  selector: 'main',
  template: '',

  imports: [forwardRef(() => OtherComp), forwardRef(() => Simple)],
})
class MainComp {
  text: string = '';
}

@Component({
  selector: 'other',
  template: '',
})
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
  selector: 'simple-shadow-dom1',
  template: 'SIMPLE1(<slot></slot>)',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: ['div {color: red}'],
})
class SimpleShadowDom1 {}

@Component({
  selector: 'simple-shadow-dom2',
  template: 'SIMPLE2(<slot></slot>)',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: ['div {color: blue}'],
})
class SimpleShadowDom2 {}

@Component({
  selector: 'empty',
  template: '',
})
class Empty {}

@Component({
  selector: 'multiple-content-tags',
  template: '(<ng-content SELECT=".left"></ng-content>, <ng-content></ng-content>)',
})
class MultipleContentTagsComponent {}

@Component({
  selector: 'single-content-tag',
  template: '<ng-content SELECT=".target"></ng-content>',
})
class SingleContentTagComponent {}

@Directive({
  selector: '[manual]',
})
class ManualViewportDirective {
  constructor(
    public vc: ViewContainerRef,
    public templateRef: TemplateRef<Object>,
  ) {}
  show() {
    this.vc.createEmbeddedView(this.templateRef);
  }
  hide() {
    this.vc.clear();
  }
}

@Directive({
  selector: '[project]',
})
class ProjectDirective {
  constructor(public vc: ViewContainerRef) {}
  show(templateRef: TemplateRef<Object>) {
    this.vc.createEmbeddedView(templateRef);
  }
  hide() {
    this.vc.clear();
  }
}

@Component({
  selector: 'outer-with-indirect-nested',
  template: 'OUTER(<simple><div><ng-content></ng-content></div></simple>)',

  imports: [Simple],
})
class OuterWithIndirectNestedComponent {}

@Component({
  selector: 'outer',
  template:
    'OUTER(<inner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></inner>)',

  imports: [forwardRef(() => InnerComponent)],
})
class OuterComponent {}

@Component({
  selector: 'inner',
  template:
    'INNER(<innerinner><ng-content select=".left" class="left"></ng-content><ng-content></ng-content></innerinner>)',

  imports: [forwardRef(() => InnerInnerComponent)],
})
class InnerComponent {}

@Component({
  selector: 'innerinner',
  template: 'INNERINNER(<ng-content select=".left"></ng-content>,<ng-content></ng-content>)',
})
class InnerInnerComponent {}

@Component({
  selector: 'conditional-content',
  template:
    '<div>(<div *manual><ng-content select=".left"></ng-content></div>, <ng-content></ng-content>)</div>',

  imports: [ManualViewportDirective],
})
class ConditionalContentComponent {}

@Component({
  selector: 'conditional-text',
  template:
    'MAIN(<ng-template manual>FIRST(<ng-template manual>SECOND(<ng-content></ng-content>)</ng-template>)</ng-template>)',

  imports: [ManualViewportDirective],
})
class ConditionalTextComponent {}

@Component({
  selector: 'tab',
  template: '<div><div *manual>TAB(<ng-content></ng-content>)</div></div>',

  imports: [ManualViewportDirective],
})
class Tab {}

@Component({
  selector: 'tree2',
  inputs: ['depth'],
  template: 'TREE2({{depth}}:<tree *manual [depth]="depth+1"></tree>)',

  imports: [ManualViewportDirective, forwardRef(() => Tree)],
})
class Tree2 {
  depth = 0;
}

@Component({
  selector: 'tree',
  inputs: ['depth'],
  template: 'TREE({{depth}}:<tree *manual [depth]="depth+1"></tree>)',

  imports: [ManualViewportDirective],
})
class Tree {
  depth = 0;
}

@Component({
  selector: 'cmp-d',
  template: `<i>{{ tagName }}</i>`,
})
class CmpD {
  tagName: string;
  constructor(elementRef: ElementRef) {
    this.tagName = elementRef.nativeElement.tagName.toLowerCase();
  }
}

@Component({
  selector: 'cmp-c',
  template: `<b>{{ tagName }}</b>`,
})
class CmpC {
  tagName: string;
  constructor(elementRef: ElementRef) {
    this.tagName = elementRef.nativeElement.tagName.toLowerCase();
  }
}

@Component({
  selector: 'cmp-b',
  template: `<ng-content></ng-content><cmp-d></cmp-d>`,

  imports: [CmpD],
})
class CmpB {}

@Component({
  selector: 'cmp-a',
  template: `<ng-content></ng-content><cmp-c></cmp-c>`,

  imports: [CmpC],
})
class CmpA {}

@Component({
  selector: 'cmp-b11',
  template: `{{ 'b11' }}`,
})
class CmpB11 {}

@Component({
  selector: 'cmp-b12',
  template: `{{ 'b12' }}`,
})
class CmpB12 {}

@Component({
  selector: 'cmp-b21',
  template: `{{ 'b21' }}`,
})
class CmpB21 {}

@Component({
  selector: 'cmp-b22',
  template: `{{ 'b22' }}`,
})
class CmpB22 {}

@Component({
  selector: 'cmp-a1',
  template: `{{ 'a1' }}<cmp-b11></cmp-b11><cmp-b12></cmp-b12>`,

  imports: [CmpB11, CmpB12],
})
class CmpA1 {}

@Component({
  selector: 'cmp-a2',
  template: `{{ 'a2' }}<cmp-b21></cmp-b21><cmp-b22></cmp-b22>`,

  imports: [CmpB21, CmpB22],
})
class CmpA2 {}
