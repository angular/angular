/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  createComponent,
  Directive,
  EnvironmentInjector,
  inject,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {TestBed} from '../../testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/private/testing/matchers';

describe('projection', () => {
  function getElementHtml(element: HTMLElement) {
    return element.innerHTML
      .replace(/<!--(\W|\w)*?-->/g, '')
      .replace(/\sng-reflect-\S*="[^"]*"/g, '');
  }

  it('should project content', () => {
    @Component({
      selector: 'child',
      template: `<div><ng-content></ng-content></div>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: '<child>content</child>',
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(`<child><div>content</div></child>`);
  });

  it('should project content when <ng-content> is at a template root', () => {
    @Component({
      selector: 'child',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: '<child>content</child>',
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(`<child>content</child>`);
  });

  it('should project content with siblings', () => {
    @Component({
      selector: 'child',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: `<child>before<div>content</div>after</child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(`<child>before<div>content</div>after</child>`);
  });

  it('should be able to re-project content', () => {
    @Component({
      selector: 'grand-child',
      template: `<div><ng-content></ng-content></div>`,
      standalone: false,
    })
    class GrandChild {}

    @Component({
      selector: 'child',
      template: `<grand-child><ng-content></ng-content></grand-child>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: `<child><b>Hello</b>World!</child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child, GrandChild]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(
      '<child><grand-child><div><b>Hello</b>World!</div></grand-child></child>',
    );
  });

  it('should project components', () => {
    @Component({
      selector: 'child',
      template: `<div><ng-content></ng-content></div>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'projected-comp',
      template: 'content',
      standalone: false,
    })
    class ProjectedComp {}

    @Component({
      selector: 'parent',
      template: `<child><projected-comp></projected-comp></child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child, ProjectedComp]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(
      '<child><div><projected-comp>content</projected-comp></div></child>',
    );
  });

  it('should project components that have their own projection', () => {
    @Component({
      selector: 'child',
      template: `<div><ng-content></ng-content></div>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'projected-comp',
      template: `<p><ng-content></ng-content></p>`,
      standalone: false,
    })
    class ProjectedComp {}

    @Component({
      selector: 'parent',
      template: `
        <child>
          <projected-comp><div>Some content</div>Other content</projected-comp>
        </child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child, ProjectedComp]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(
      `<child><div><projected-comp><p><div>Some content</div>Other content</p></projected-comp></div></child>`,
    );
  });

  it('should project with multiple instances of a component with projection', () => {
    @Component({
      selector: 'child',
      template: `<div><ng-content></ng-content></div>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'projected-comp',
      template: `Before<ng-content></ng-content>After`,
      standalone: false,
    })
    class ProjectedComp {}

    @Component({
      selector: 'parent',
      template: `
        <child>
          <projected-comp><div>A</div><p>123</p></projected-comp>
          <projected-comp><div>B</div><p>456</p></projected-comp>
        </child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child, ProjectedComp]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(
      '<child><div>' +
        '<projected-comp>Before<div>A</div><p>123</p>After</projected-comp>' +
        '<projected-comp>Before<div>B</div><p>456</p>After</projected-comp>' +
        '</div></child>',
    );
  });

  it('should re-project with multiple instances of a component with projection', () => {
    @Component({
      selector: 'child',
      template: `<div><ng-content></ng-content></div>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'projected-comp',
      template: `Before<ng-content></ng-content>After`,
      standalone: false,
    })
    class ProjectedComp {}

    @Component({
      selector: 'parent',
      template: `
        <child>
          <projected-comp><div>A</div><ng-content></ng-content><p>123</p></projected-comp>
          <projected-comp><div>B</div><p>456</p></projected-comp>
        </child>`,
      standalone: false,
    })
    class Parent {}

    @Component({
      selector: 'app',
      template: `
        <parent>**ABC**</parent>
        <parent>**DEF**</parent>
     `,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Parent, Child, ProjectedComp]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe(
      '<parent><child><div>' +
        '<projected-comp>Before<div>A</div>**ABC**<p>123</p>After</projected-comp>' +
        '<projected-comp>Before<div>B</div><p>456</p>After</projected-comp>' +
        '</div></child></parent>' +
        '<parent><child><div>' +
        '<projected-comp>Before<div>A</div>**DEF**<p>123</p>After</projected-comp>' +
        '<projected-comp>Before<div>B</div><p>456</p>After</projected-comp>' +
        '</div></child></parent>',
    );
  });

  it('should project into dynamic views (with createEmbeddedView)', () => {
    @Component({
      selector: 'child',
      template: `Before-<ng-template [ngIf]="showing"><ng-content></ng-content></ng-template>-After`,
      standalone: false,
    })
    class Child {
      showing = false;
    }

    @Component({
      selector: 'parent',
      template: `<child><div>A</div>Some text</child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child], imports: [CommonModule]});

    const fixture = TestBed.createComponent(Parent);
    const childDebugEl = fixture.debugElement.query(By.directive(Child));
    const childInstance = childDebugEl.injector.get(Child);
    const childElement = childDebugEl.nativeElement as HTMLElement;

    childInstance.showing = true;
    fixture.detectChanges();

    expect(getElementHtml(childElement)).toBe(`Before-<div>A</div>Some text-After`);

    childInstance.showing = false;
    fixture.detectChanges();

    expect(getElementHtml(childElement)).toBe(`Before--After`);

    childInstance.showing = true;
    fixture.detectChanges();
    expect(getElementHtml(childElement)).toBe(`Before-<div>A</div>Some text-After`);
  });

  it('should project into dynamic views with specific selectors', () => {
    @Component({
      selector: 'child',
      template: `
        <ng-content></ng-content>
        Before-
        <ng-template [ngIf]="showing">
          <ng-content select="div"></ng-content>
        </ng-template>
        -After`,
      standalone: false,
    })
    class Child {
      showing = false;
    }

    @Component({
      selector: 'parent',
      template: `
        <child>
          <div>A</div>
          <span>B</span>
        </child>
      `,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child], imports: [CommonModule]});

    const fixture = TestBed.createComponent(Parent);
    const childDebugEl = fixture.debugElement.query(By.directive(Child));
    const childInstance = childDebugEl.injector.get(Child);

    childInstance.showing = true;
    fixture.detectChanges();

    expect(getElementHtml(fixture.nativeElement)).toBe(
      '<child><span>B</span> Before- <div>A</div> -After</child>',
    );

    childInstance.showing = false;
    fixture.detectChanges();
    expect(getElementHtml(fixture.nativeElement)).toBe(
      '<child><span>B</span> Before-  -After</child>',
    );

    childInstance.showing = true;
    fixture.detectChanges();
    expect(getElementHtml(fixture.nativeElement)).toBe(
      '<child><span>B</span> Before- <div>A</div> -After</child>',
    );
  });

  it('should project if <ng-content> is in a template that has different declaration/insertion points', () => {
    @Component({
      selector: 'comp',
      template: `<ng-template><ng-content></ng-content></ng-template>`,
      standalone: false,
    })
    class Comp {
      @ViewChild(TemplateRef, {static: true}) template!: TemplateRef<any>;
    }

    @Directive({
      selector: '[trigger]',
      standalone: false,
    })
    class Trigger {
      @Input() trigger!: Comp;

      constructor(public vcr: ViewContainerRef) {}

      open() {
        this.vcr.createEmbeddedView(this.trigger.template);
      }
    }

    @Component({
      selector: 'parent',
      template: `
        <button [trigger]="comp"></button>
        <comp #comp>Some content</comp>
      `,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Trigger, Comp]});

    const fixture = TestBed.createComponent(Parent);
    const trigger = fixture.debugElement.query(By.directive(Trigger)).injector.get(Trigger);
    fixture.detectChanges();

    expect(getElementHtml(fixture.nativeElement)).toBe(`<button></button><comp></comp>`);

    trigger.open();
    expect(getElementHtml(fixture.nativeElement)).toBe(
      `<button></button>Some content<comp></comp>`,
    );
  });

  it('should project nodes into the last ng-content', () => {
    @Component({
      selector: 'child',
      template: `<div><ng-content></ng-content></div>
          <span><ng-content></ng-content></span>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: `<child>content</child>`,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child], imports: [CommonModule]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(getElementHtml(fixture.nativeElement)).toBe(
      '<child><div></div><span>content</span></child>',
    );
  });

  // https://stackblitz.com/edit/angular-ceqmnw?file=src%2Fapp%2Fapp.component.ts
  it('should project nodes into the last ng-content unrolled by ngFor', () => {
    @Component({
      selector: 'child',
      template:
        '<div *ngFor="let item of [1, 2]; let i = index">({{i}}):<ng-content></ng-content></div>',
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: '<child>content</child>',
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child], imports: [CommonModule]});
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();

    expect(getElementHtml(fixture.nativeElement)).toBe(
      '<child><div>(0):</div><div>(1):content</div></child>',
    );
  });

  it('should handle projected containers inside other containers', () => {
    @Component({
      selector: 'nested-comp',
      template: `<div>Child content</div>`,
      standalone: false,
    })
    class NestedComp {}

    @Component({
      selector: 'root-comp',
      template: `<ng-content></ng-content>`,
      standalone: false,
    })
    class RootComp {}

    @Component({
      selector: 'my-app',
      template: `
        <root-comp>
          <ng-container *ngFor="let item of items; last as last">
            <nested-comp *ngIf="!last"></nested-comp>
          </ng-container>
        </root-comp>
      `,
      standalone: false,
    })
    class MyApp {
      items = [1, 2];
    }

    TestBed.configureTestingModule({
      declarations: [MyApp, RootComp, NestedComp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    // expecting # of divs to be (items.length - 1), since last element is filtered out by *ngIf,
    // this applies to all other assertions below
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(1);

    fixture.componentInstance.items = [3, 4, 5];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(2);

    fixture.componentInstance.items = [6, 7, 8, 9];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(3);
  });

  it('should handle projection into element containers at the view root', () => {
    @Component({
      selector: 'root-comp',
      template: `
        <ng-template [ngIf]="show">
          <ng-container>
            <ng-content></ng-content>
          </ng-container>
        </ng-template>`,
      standalone: false,
    })
    class RootComp {
      @Input() show: boolean = true;
    }

    @Component({
      selector: 'my-app',
      template: `<root-comp [show]="show"><div></div></root-comp>
      `,
      standalone: false,
    })
    class MyApp {
      show = true;
    }

    TestBed.configureTestingModule({declarations: [MyApp, RootComp]});
    const fixture = TestBed.createComponent(MyApp);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(1);

    fixture.componentInstance.show = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(0);
  });

  it('should handle projection of views with element containers at the root', () => {
    @Component({
      selector: 'root-comp',
      template: `<ng-template [ngIf]="show"><ng-content></ng-content></ng-template>`,
      standalone: false,
    })
    class RootComp {
      @Input() show: boolean = true;
    }

    @Component({
      selector: 'my-app',
      template: `<root-comp [show]="show"><ng-container><div></div></ng-container></root-comp>`,
      standalone: false,
    })
    class MyApp {
      show = true;
    }

    TestBed.configureTestingModule({declarations: [MyApp, RootComp]});
    const fixture = TestBed.createComponent(MyApp);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(1);

    fixture.componentInstance.show = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(0);
  });

  it('should project ng-container at the content root', () => {
    @Component({
      selector: 'child',
      template: `<ng-content></ng-content>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: `<child>
      <ng-container>
        <ng-container>content</ng-container>
      </ng-container>
    </child>
      `,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child]});
    const fixture = TestBed.createComponent(Parent);

    fixture.detectChanges();
    expect(getElementHtml(fixture.nativeElement)).toBe('<child>content</child>');
  });

  it('should re-project ng-container at the content root', () => {
    @Component({
      selector: 'grand-child',
      template: `<ng-content></ng-content>`,
      standalone: false,
    })
    class GrandChild {}

    @Component({
      selector: 'child',
      template: `<grand-child>
      <ng-content></ng-content>
    </grand-child>`,
      standalone: false,
    })
    class Child {}

    @Component({
      selector: 'parent',
      template: `<child>
      <ng-container>
        <ng-container>content</ng-container>
      </ng-container>
    </child>
      `,
      standalone: false,
    })
    class Parent {}

    TestBed.configureTestingModule({declarations: [Parent, Child, GrandChild]});
    const fixture = TestBed.createComponent(Parent);

    fixture.detectChanges();
    expect(getElementHtml(fixture.nativeElement)).toBe(
      '<child><grand-child>content</grand-child></child>',
    );
  });

  it('should handle re-projection at the root of an embedded view', () => {
    @Component({
      selector: 'child-comp',
      template: `<ng-template [ngIf]="show"><ng-content></ng-content></ng-template>`,
      standalone: false,
    })
    class ChildComp {
      @Input() show: boolean = true;
    }

    @Component({
      selector: 'parent-comp',
      template: `<child-comp [show]="show"><ng-content></ng-content></child-comp>`,
      standalone: false,
    })
    class ParentComp {
      @Input() show: boolean = true;
    }

    @Component({
      selector: 'my-app',
      template: `<parent-comp [show]="show"><div></div></parent-comp>`,
      standalone: false,
    })
    class MyApp {
      show = true;
    }

    TestBed.configureTestingModule({declarations: [MyApp, ParentComp, ChildComp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(1);

    fixture.componentInstance.show = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(0);
  });

  describe('with selectors', () => {
    it('should project nodes using attribute selectors', () => {
      @Component({
        selector: 'child',
        template: `<div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
          <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span title="toFirst">1</span><span title="toSecond">2</span></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div id="first"><span title="toFirst">1</span></div><div id="second"><span title="toSecond">2</span></div></child>',
      );
    });

    it('should project nodes using class selectors', () => {
      @Component({
        selector: 'child',
        template: `<div id="first"><ng-content select="span.toFirst"></ng-content></div>
          <div id="second"><ng-content select="span.toSecond"></ng-content></div>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span class="toFirst">1</span><span class="toSecond">2</span></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div id="first"><span class="toFirst">1</span></div><div id="second"><span class="toSecond">2</span></div></child>',
      );
    });

    it('should project nodes using class selectors when element has multiple classes', () => {
      @Component({
        selector: 'child',
        template: `<div id="first"><ng-content select="span.toFirst"></ng-content></div>
          <div id="second"><ng-content select="span.toSecond"></ng-content></div>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span class="other toFirst">1</span><span class="noise toSecond">2</span></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div id="first"><span class="other toFirst">1</span></div><div id="second"><span class="noise toSecond">2</span></div></child>',
      );
    });

    it('should project nodes into the first matching selector', () => {
      @Component({
        selector: 'child',
        template: `<div id="first"><ng-content select="span"></ng-content></div>
          <div id="second"><ng-content select="span.toSecond"></ng-content></div>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span class="toFirst">1</span><span class="toSecond">2</span></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div id="first"><span class="toFirst">1</span><span class="toSecond">2</span></div><div id="second"></div></child>',
      );
    });

    it('should allow mixing ng-content with and without selectors', () => {
      @Component({
        selector: 'child',
        template: `<div id="first"><ng-content select="span.toFirst"></ng-content></div>
          <div id="second"><ng-content></ng-content></div>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span class="toFirst">1</span><span>remaining</span>more remaining</child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div id="first"><span class="toFirst">1</span></div><div id="second"><span>remaining</span>more remaining</div></child>',
      );
    });

    it('should allow mixing ng-content with and without selectors - ng-content first', () => {
      @Component({
        selector: 'child',
        template: `<div id="first"><ng-content></ng-content></div>
          <div id="second"><ng-content select="span.toSecond"></ng-content></div>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span>1</span><span class="toSecond">2</span>remaining</child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div id="first"><span>1</span>remaining</div><div id="second"><span class="toSecond">2</span></div></child>',
      );
    });

    /**
     * Descending into projected content for selector-matching purposes is not supported
     * today: https://plnkr.co/edit/MYQcNfHSTKp9KvbzJWVQ?p=preview
     */
    it('should not descend into re-projected content', () => {
      @Component({
        selector: 'grand-child',
        template: `<ng-content select="span"></ng-content><hr><ng-content></ng-content>`,
        standalone: false,
      })
      class GrandChild {}

      @Component({
        selector: 'child',
        template: `<grand-child>
            <ng-content></ng-content>
            <span>in child template</span>
          </grand-child>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span>parent content</span></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [GrandChild, Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><grand-child><span>in child template</span><hr><span>parent content</span></grand-child></child>',
      );
    });

    it('should not descend into re-projected content', () => {
      @Component({
        selector: 'card',
        template: `<ng-content select="[card-title]"></ng-content><hr><ng-content select="[card-content]"></ng-content>`,
        standalone: false,
      })
      class Card {}

      @Component({
        selector: 'card-with-title',
        template: `<card>
         <h1 card-title>Title</h1>
         <ng-content card-content></ng-content>
       </card>`,
        standalone: false,
      })
      class CardWithTitle {}

      @Component({
        selector: 'parent',
        template: `<card-with-title>content</card-with-title>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Card, CardWithTitle, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<card-with-title><card><h1 card-title="">Title</h1><hr>content</card></card-with-title>',
      );
    });

    it('should not match selectors against node having ngProjectAs attribute', () => {
      @Component({
        selector: 'child',
        template: `<ng-content select="div"></ng-content>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><div ngProjectAs="span">should not project</div><div>should project</div></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><div>should project</div></child>',
      );
    });

    // https://stackblitz.com/edit/angular-psokum?file=src%2Fapp%2Fapp.module.ts
    it('should project nodes where attribute selector matches a binding', () => {
      @Component({
        selector: 'child',
        template: `<ng-content select="[title]"></ng-content>`,
        standalone: false,
      })
      class Child {}

      @Component({
        selector: 'parent',
        template: `<child><span [title]="'Some title'">Has title</span></child>`,
        standalone: false,
      })
      class Parent {}

      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><span title="Some title">Has title</span></child>',
      );
    });

    it('should match selectors against projected containers', () => {
      @Component({
        selector: 'child',
        template: `<span><ng-content select="div"></ng-content></span>`,
        standalone: false,
      })
      class Child {}

      @Component({
        template: `<child><div *ngIf="value">content</div></child>`,
        standalone: false,
      })
      class Parent {
        value = false;
      }
      TestBed.configureTestingModule({declarations: [Child, Parent]});
      const fixture = TestBed.createComponent(Parent);

      fixture.componentInstance.value = true;
      fixture.detectChanges();

      expect(getElementHtml(fixture.nativeElement)).toEqual(
        '<child><span><div>content</div></span></child>',
      );
    });
  });

  it('should handle projected containers inside other containers', () => {
    @Component({
      selector: 'child-comp', //
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class ChildComp {}

    @Component({
      selector: 'root-comp', //
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class RootComp {}

    @Component({
      selector: 'my-app',
      template: `
        <root-comp>
          <ng-container *ngFor="let item of items; last as last">
            <child-comp *ngIf="!last">{{ item }}|</child-comp>
          </ng-container>
        </root-comp>
      `,
      standalone: false,
    })
    class MyApp {
      items: number[] = [1, 2, 3];
    }

    TestBed.configureTestingModule({declarations: [ChildComp, RootComp, MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    // expecting # of elements to be (items.length - 1), since last element is filtered out by
    // *ngIf, this applies to all other assertions below
    expect(fixture.nativeElement).toHaveText('1|2|');

    fixture.componentInstance.items = [4, 5];
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('4|');

    fixture.componentInstance.items = [6, 7, 8, 9];
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('6|7|8|');
  });

  it('should project content if the change detector has been detached', () => {
    @Component({
      selector: 'my-comp',
      template: '<ng-content></ng-content>',
      standalone: false,
    })
    class MyComp {
      constructor(changeDetectorRef: ChangeDetectorRef) {
        changeDetectorRef.detach();
      }
    }

    @Component({
      selector: 'my-app',
      template: `
        <my-comp>
          <p>hello</p>
        </my-comp>
      `,
      standalone: false,
    })
    class MyApp {}

    TestBed.configureTestingModule({declarations: [MyComp, MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('hello');
  });

  it('should support ngProjectAs with a various number of other bindings and attributes', () => {
    @Directive({
      selector: '[color],[margin]',
      standalone: false,
    })
    class ElDecorator {
      @Input() color?: string;
      @Input() margin?: number;
    }
    @Component({
      selector: 'card',
      template: `
        <ng-content select="[card-title]"></ng-content>
        ---
        <ng-content select="[card-subtitle]"></ng-content>
        ---
        <ng-content select="[card-content]"></ng-content>
        ---
        <ng-content select="[card-footer]"></ng-content>
      `,
      standalone: false,
    })
    class Card {}

    @Component({
      selector: 'card-with-title',
      template: `
        <card>
         <h1 [color]="'red'" [margin]="10" ngProjectAs="[card-title]">Title</h1>
         <h2  xlink:href="google.com" ngProjectAs="[card-subtitle]">Subtitle</h2>
         <div style="font-color: blue;" ngProjectAs="[card-content]">content</div>
         <div [color]="'blue'" ngProjectAs="[card-footer]">footer</div>
        </card>
      `,
      standalone: false,
    })
    class CardWithTitle {}

    TestBed.configureTestingModule({declarations: [Card, CardWithTitle, ElDecorator]});
    const fixture = TestBed.createComponent(CardWithTitle);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toEqual('Title --- Subtitle --- content --- footer');
  });

  it('should support ngProjectAs on elements (including <ng-content>)', () => {
    @Component({
      selector: 'card',
      template: `
        <ng-content select="[card-title]"></ng-content>
        ---
        <ng-content select="[card-content]"></ng-content>
      `,
      standalone: false,
    })
    class Card {}

    @Component({
      selector: 'card-with-title',
      template: `
        <card>
         <h1 ngProjectAs="[card-title]">Title</h1>
         <ng-content ngProjectAs="[card-content]"></ng-content>
        </card>
      `,
      standalone: false,
    })
    class CardWithTitle {}

    @Component({
      selector: 'app',
      template: `
        <card-with-title>content</card-with-title>
      `,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [Card, CardWithTitle, App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toEqual('Title --- content');
  });

  it('should not match multiple selectors in ngProjectAs', () => {
    @Component({
      selector: 'card',
      template: `
        <ng-content select="[card-title]"></ng-content>
        content
      `,
      standalone: false,
    })
    class Card {}

    @Component({
      template: `
        <card>
         <h1 ngProjectAs="[non-existing-title-slot],[card-title]">Title</h1>
        </card>
      `,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [Card, App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toEqual('Title content');
  });

  it('should preserve ngProjectAs and other attributes on projected element', () => {
    @Component({
      selector: 'projector',
      template: `<ng-content select="projectMe"></ng-content>`,
      standalone: false,
    })
    class Projector {}

    @Component({
      template: `
        <projector>
          <div ngProjectAs="projectMe" title="some title"></div>
        </projector>
      `,
      standalone: false,
    })
    class Root {}

    TestBed.configureTestingModule({
      declarations: [Root, Projector],
    });
    const fixture = TestBed.createComponent(Root);
    fixture.detectChanges();

    const projectedElement = fixture.debugElement.query(By.css('div'));
    const {ngProjectAs, title} = projectedElement.attributes;
    expect(ngProjectAs).toBe('projectMe');
    expect(title).toBe('some title');
  });

  describe('on inline templates (e.g.  *ngIf)', () => {
    it('should work when matching the element name', () => {
      let divDirectives = 0;
      @Component({
        selector: 'selector-proj',
        template: '<ng-content select="div"></ng-content>',
        standalone: false,
      })
      class SelectedNgContentComp {}

      @Directive({
        selector: 'div',
        standalone: false,
      })
      class DivDirective {
        constructor() {
          divDirectives++;
        }
      }

      @Component({
        selector: 'main-selector',
        template: '<selector-proj><div x="true" *ngIf="true">Hello world!</div></selector-proj>',
        standalone: false,
      })
      class SelectorMainComp {}

      TestBed.configureTestingModule({
        declarations: [DivDirective, SelectedNgContentComp, SelectorMainComp],
      });
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Hello world!');
      expect(divDirectives).toEqual(1);
    });

    it('should work when matching attributes', () => {
      let xDirectives = 0;
      @Component({
        selector: 'selector-proj',
        template: '<ng-content select="[x]"></ng-content>',
        standalone: false,
      })
      class SelectedNgContentComp {}

      @Directive({
        selector: '[x]',
        standalone: false,
      })
      class XDirective {
        constructor() {
          xDirectives++;
        }
      }

      @Component({
        selector: 'main-selector',
        template: '<selector-proj><div x="true" *ngIf="true">Hello world!</div></selector-proj>',
        standalone: false,
      })
      class SelectorMainComp {}

      TestBed.configureTestingModule({
        declarations: [XDirective, SelectedNgContentComp, SelectorMainComp],
      });
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Hello world!');
      expect(xDirectives).toEqual(1);
    });

    it('should work when matching classes', () => {
      let xDirectives = 0;
      @Component({
        selector: 'selector-proj',
        template: '<ng-content select=".x"></ng-content>',
        standalone: false,
      })
      class SelectedNgContentComp {}

      @Directive({
        selector: '.x',
        standalone: false,
      })
      class XDirective {
        constructor() {
          xDirectives++;
        }
      }

      @Component({
        selector: 'main-selector',
        template: '<selector-proj><div class="x" *ngIf="true">Hello world!</div></selector-proj>',
        standalone: false,
      })
      class SelectorMainComp {}

      TestBed.configureTestingModule({
        declarations: [XDirective, SelectedNgContentComp, SelectorMainComp],
      });
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Hello world!');
      expect(xDirectives).toEqual(1);
    });

    it('should ignore synthesized attributes (e.g. ngTrackBy)', () => {
      @Component({
        selector: 'selector-proj',
        template: '<ng-content select="[ngTrackBy]"></ng-content>',
        standalone: false,
      })
      class SelectedNgContentComp {}

      @Component({
        selector: 'main-selector',
        template:
          'inline(<selector-proj><div *ngFor="let item of items trackBy getItemId">{{item.name}}</div></selector-proj>)' +
          'ng-template(<selector-proj><ng-template ngFor [ngForOf]="items" let-item ngTrackBy="getItemId"><div>{{item.name}}</div></ng-template></selector-proj>)',
        standalone: false,
      })
      class SelectorMainComp {
        items = [
          {id: 1, name: 'one'},
          {id: 2, name: 'two'},
          {id: 3, name: 'three'},
        ];
        getItemId(item: {id: number}) {
          return item.id;
        }
      }

      TestBed.configureTestingModule({declarations: [SelectedNgContentComp, SelectorMainComp]});
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('inline()ng-template(onetwothree)');
    });

    it('should project template content with `ngProjectAs` defined', () => {
      @Component({
        selector: 'projector-app',
        template: `
          Projected
          <ng-content select="foo"></ng-content>
          <ng-content select="[foo]"></ng-content>
          <ng-content select=".foo"></ng-content>
        `,
        standalone: false,
      })
      class ProjectorApp {}

      @Component({
        selector: 'root-comp',
        template: `
          <projector-app>
            <div *ngIf="show" ngProjectAs="foo">as element</div>
            <div *ngIf="show" ngProjectAs="[foo]">as attribute</div>
            <div *ngIf="show" ngProjectAs=".foo">as class</div>
          </projector-app>
        `,
        standalone: false,
      })
      class RootComp {
        show = true;
      }

      TestBed.configureTestingModule({
        declarations: [ProjectorApp, RootComp],
      });
      const fixture = TestBed.createComponent(RootComp);
      fixture.detectChanges();

      let content = fixture.nativeElement.textContent;
      expect(content).toContain('as element');
      expect(content).toContain('as attribute');
      expect(content).toContain('as class');

      fixture.componentInstance.show = false;
      fixture.detectChanges();

      content = fixture.nativeElement.textContent;
      expect(content).not.toContain('as element');
      expect(content).not.toContain('as attribute');
      expect(content).not.toContain('as class');
    });

    describe('on containers', () => {
      it('should work when matching attributes', () => {
        let xDirectives = 0;
        @Component({
          selector: 'selector-proj',
          template: '<ng-content select="[x]"></ng-content>',
          standalone: false,
        })
        class SelectedNgContentComp {}

        @Directive({
          selector: '[x]',
          standalone: false,
        })
        class XDirective {
          constructor() {
            xDirectives++;
          }
        }

        @Component({
          selector: 'main-selector',
          template:
            '<selector-proj><ng-container x="true">Hello world!</ng-container></selector-proj>',
          standalone: false,
        })
        class SelectorMainComp {}

        TestBed.configureTestingModule({
          declarations: [XDirective, SelectedNgContentComp, SelectorMainComp],
        });
        const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('Hello world!');
        expect(xDirectives).toEqual(1);
      });

      it('should work when matching classes', () => {
        let xDirectives = 0;
        @Component({
          selector: 'selector-proj',
          template: '<ng-content select=".x"></ng-content>',
          standalone: false,
        })
        class SelectedNgContentComp {}

        @Directive({
          selector: '.x',
          standalone: false,
        })
        class XDirective {
          constructor() {
            xDirectives++;
          }
        }

        @Component({
          selector: 'main-selector',
          template:
            '<selector-proj><ng-container class="x">Hello world!</ng-container></selector-proj>',
          standalone: false,
        })
        class SelectorMainComp {}

        TestBed.configureTestingModule({
          declarations: [XDirective, SelectedNgContentComp, SelectorMainComp],
        });
        const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('Hello world!');
        expect(xDirectives).toEqual(1);
      });

      it('should work without exception when subelement has both ngIf and class as interpolation', () => {
        @Component({
          selector: 'child-comp',
          template: '<ng-content select=".nomatch"></ng-content>',
          standalone: false,
        })
        class ChildComp {}

        @Component({
          selector: 'parent-comp',
          template: `<child-comp><span *ngIf="true" class="{{'a'}}"></span></child-comp>`,
          standalone: false,
        })
        class ParentComp {}

        TestBed.configureTestingModule({declarations: [ParentComp, ChildComp]});
        const fixture = TestBed.createComponent<ParentComp>(ParentComp);

        fixture.detectChanges();
        expect(fixture.nativeElement.innerHTML).toBe('<child-comp></child-comp>');
      });
    });

    it('selection of child element should properly work even with confusing attribute names', () => {
      @Component({
        selector: 'child-comp',
        template: '<ng-content select=".title"></ng-content>',
        standalone: false,
      })
      class ChildComp {}

      @Component({
        selector: 'parent-comp',
        template: `<child-comp><span *ngIf="true" id="5" jjj="class" class="{{'a'}}" [title]="'abc'"></span></child-comp>`,
        standalone: false,
      })
      class ParentComp {}

      TestBed.configureTestingModule({declarations: [ParentComp, ChildComp]});
      const fixture = TestBed.createComponent<ParentComp>(ParentComp);

      fixture.detectChanges();
      // tNode.attrs will be ['id', '5', 'jjj', 'class', 3 /* AttributeMarker.Bindings */, 'class',
      // 'title', 4 /* AttributeMarker.Template */, 'ngIf'] isNodeMatchingSelector() must not
      // confuse it as 'class=title' attribute. <ng-content select=".title"> should not match the
      // child.
      expect(fixture.nativeElement.innerHTML).toBe('<child-comp></child-comp>');
    });
  });

  describe('fallback content', () => {
    it('should render the fallback content if nothing is projected into a slot', () => {
      @Component({
        selector: 'projection',
        template:
          `
          <ng-content select="[one]">One fallback</ng-content>|` +
          `<ng-content>Catch-all fallback</ng-content>|` +
          `<ng-content select="[two]">Two fallback</ng-content>` +
          `<ng-content select="[three]">Three fallback</ng-content>
        `,
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
          <projection>
            <span one>One</span>
            <div three>Three</div>
          </projection>
        `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      expect(getElementHtml(fixture.nativeElement)).toContain(
        `<projection><span one="">One</span>|` +
          `Catch-all fallback|Two fallback<div three="">Three</div></projection>`,
      );
    });

    it('should render the catch-all slots fallback content if the element only contains comments', () => {
      @Component({
        selector: 'projection',
        template: `<ng-content>Fallback content</ng-content>`,
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
            <projection>
              <!-- One -->


              <!-- Two -->
            </projection>
          `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      expect(getElementHtml(fixture.nativeElement)).toContain(
        `<projection>Fallback content</projection>`,
      );
    });

    it('should account for ngProjectAs when rendering fallback content', () => {
      @Component({
        selector: 'projection',
        template: `<ng-content select="div">I have no divs</ng-content>|<ng-content select="span">I have no spans</ng-content>`,
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
          <projection>
            <div ngProjectAs="span">div pretending to be a span</div>
          </projection>
        `,
      })
      class App {
        @ViewChild(Projection) projection!: Projection;
      }

      const fixture = TestBed.createComponent(App);
      expect(getElementHtml(fixture.nativeElement)).toContain(
        `<projection>I have no divs|` +
          `<div ngprojectas="span">div pretending to be a span</div></projection>`,
      );
    });

    it('should not render the fallback content if there is a control flow expression', () => {
      @Component({
        selector: 'projection',
        template: `<ng-content>Wildcard fallback</ng-content>|<ng-content select="span">Span fallback</ng-content>`,
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
          <projection>
            @if (showSpan) {
              <span>Span override</span>
            }
          </projection>
        `,
      })
      class App {
        showSpan = false;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(
        `<projection>Wildcard fallback|</projection>`,
      );

      fixture.componentInstance.showSpan = true;
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(
        `<projection>Wildcard fallback|<span>Span override</span></projection>`,
      );

      fixture.componentInstance.showSpan = false;
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(
        `<projection>Wildcard fallback|</projection>`,
      );
    });

    it('should not render the fallback content if there is an ng-container', () => {
      @Component({
        selector: 'projection',
        template: `<ng-content>Fallback</ng-content>`,
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
          <projection><ng-container/></projection>
        `,
      })
      class App {
        showSpan = false;
      }

      const fixture = TestBed.createComponent(App);
      expect(getElementHtml(fixture.nativeElement)).toContain(`<projection></projection>`);
    });

    it('should be able to use data bindings in the fallback content', () => {
      @Component({
        selector: 'projection',
        template: `<ng-content>Value: {{value}}</ng-content>`,
      })
      class Projection {
        value = 0;
      }

      @Component({imports: [Projection], template: `<projection/>`})
      class App {
        @ViewChild(Projection) projection!: Projection;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(`<projection>Value: 0</projection>`);

      fixture.componentInstance.projection.value = 1;
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(`<projection>Value: 1</projection>`);
    });

    it('should be able to use event listeners in the fallback content', () => {
      @Component({
        selector: 'projection',
        template: `
          <ng-content>
            <button (click)="callback()">Click me</button>
          </ng-content>

          Value: {{value}}
        `,
      })
      class Projection {
        value = 0;

        callback() {
          this.value++;
        }
      }

      @Component({imports: [Projection], template: `<projection/>`})
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(`Value: 0`);

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(`Value: 1`);
    });

    it('should create and destroy directives in the fallback content', () => {
      let directiveCount = 0;

      @Directive({
        selector: 'fallback-dir',
      })
      class FallbackDir implements OnDestroy {
        constructor() {
          directiveCount++;
        }

        ngOnDestroy(): void {
          directiveCount--;
        }
      }

      @Component({
        selector: 'projection',
        template: `<ng-content><fallback-dir/></ng-content>`,
        imports: [FallbackDir],
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
          @if (hasProjection) {
            <projection/>
          }
        `,
      })
      class App {
        hasProjection = true;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(directiveCount).toBe(1);

      fixture.componentInstance.hasProjection = false;
      fixture.detectChanges();
      expect(directiveCount).toBe(0);
    });

    it('should be able to query inside the fallback content', () => {
      let directiveInstance: FallbackDir | undefined;

      @Directive({
        selector: 'fallback-dir',
      })
      class FallbackDir {
        constructor() {
          directiveInstance = this;
        }
      }

      @Component({
        selector: 'projection',
        template: `<ng-content><fallback-dir/></ng-content>`,
        imports: [FallbackDir],
      })
      class Projection {
        @ViewChild(FallbackDir) fallback!: FallbackDir;
      }

      @Component({
        imports: [Projection],
        template: `<projection/>`,
      })
      class App {
        @ViewChild(Projection) projection!: Projection;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveInstance).toBeTruthy();
      expect(fixture.componentInstance.projection.fallback).toBe(directiveInstance!);
    });

    it('should be able to inject the host component from inside the fallback content', () => {
      @Directive({
        selector: 'fallback-dir',
      })
      class FallbackDir {
        host = inject(Projection);
      }

      @Component({
        selector: 'projection',
        template: `<ng-content><fallback-dir/></ng-content>`,
        imports: [FallbackDir],
      })
      class Projection {
        @ViewChild(FallbackDir) fallback!: FallbackDir;
      }

      @Component({
        imports: [Projection],
        template: `<projection/>`,
      })
      class App {
        @ViewChild(Projection) projection!: Projection;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const instance = fixture.componentInstance;
      expect(instance.projection.fallback.host).toBe(instance.projection);
    });

    it('should render the fallback content if content is not provided through projectableNodes', () => {
      @Component({
        template:
          `<ng-content>One fallback</ng-content>|` +
          `<ng-content>Two fallback</ng-content>|<ng-content>Three fallback</ng-content>`,
      })
      class Projection {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const paragraph = document.createElement('p');
      paragraph.textContent = 'override';
      const projectableNodes = [[paragraph]];
      const componentRef = createComponent(Projection, {
        hostElement,
        environmentInjector,
        projectableNodes,
      });
      componentRef.changeDetectorRef.detectChanges();

      expect(getElementHtml(hostElement)).toContain('<p>override</p>|Two fallback|Three fallback');
      componentRef.destroy();
    });

    it('should render the content through projectableNodes along with fallback', () => {
      @Component({
        template:
          `<ng-content>One fallback</ng-content>|` +
          `<ng-content>Two fallback</ng-content>|<ng-content>Three fallback</ng-content>`,
      })
      class Projection {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const paragraph = document.createElement('p');
      paragraph.textContent = 'override';
      const secondParagraph = document.createElement('p');
      secondParagraph.textContent = 'override';
      const projectableNodes = [[paragraph], [], [secondParagraph]];
      const componentRef = createComponent(Projection, {
        hostElement,
        environmentInjector,
        projectableNodes,
      });
      componentRef.changeDetectorRef.detectChanges();

      expect(getElementHtml(hostElement)).toContain('<p>override</p>|Two fallback|<p>override</p>');
    });

    it('should render fallback content when ng-content is inside an ng-template', () => {
      @Component({
        selector: 'projection',
        template: `<ng-container #ref/><ng-template #template><ng-content>Fallback</ng-content></ng-template>`,
      })
      class Projection {
        @ViewChild('template') template!: TemplateRef<unknown>;
        @ViewChild('ref', {read: ViewContainerRef}) viewContainerRef!: ViewContainerRef;

        createContent() {
          this.viewContainerRef.createEmbeddedView(this.template);
        }
      }

      @Component({
        imports: [Projection],
        template: `<projection/>`,
      })
      class App {
        @ViewChild(Projection) projection!: Projection;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(`<projection></projection>`);

      fixture.componentInstance.projection.createContent();
      fixture.detectChanges();
      expect(getElementHtml(fixture.nativeElement)).toContain(`<projection>Fallback</projection>`);
    });

    it('should render the fallback content when ng-content is re-projected', () => {
      @Component({
        selector: 'inner-projection',
        template: `
          <ng-content select="[inner-header]">Inner header fallback</ng-content>
          <ng-content select="[inner-footer]">Inner footer fallback</ng-content>
        `,
      })
      class InnerProjection {}

      @Component({
        selector: 'projection',
        template: `
          <inner-projection>
            <ng-content select="[outer-header]" inner-header>Outer header fallback</ng-content>
            <ng-content select="[outer-footer]" inner-footer>Outer footer fallback</ng-content>
          </inner-projection>
        `,
        imports: [InnerProjection],
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `
          <projection>
            <span outer-header>Outer header override</span>
          </projection>
        `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      const content = getElementHtml(fixture.nativeElement);

      expect(content).toContain('Outer header override');
      expect(content).toContain('Outer footer fallback');
    });

    it('should not instantiate directives inside the fallback content', () => {
      let creationCount = 0;

      @Component({
        selector: 'fallback',
        template: 'Fallback',
      })
      class Fallback {
        constructor() {
          creationCount++;
        }
      }

      @Component({
        selector: 'projection',
        template: `<ng-content><fallback/></ng-content>`,
        imports: [Fallback],
      })
      class Projection {}

      @Component({
        imports: [Projection],
        template: `<projection>Hello</projection>`,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      expect(creationCount).toBe(0);
      expect(getElementHtml(fixture.nativeElement)).toContain(`<projection>Hello</projection>`);
    });

    it(
      'should render the fallback content when an instance of a component that uses ' +
        'fallback content is declared after one that does not',
      () => {
        @Component({
          selector: 'projection',
          template: `<ng-content>Fallback</ng-content>`,
        })
        class Projection {}

        @Component({
          imports: [Projection],
          template: `
            <projection>Content</projection>
            <projection/>
          `,
        })
        class App {}

        const fixture = TestBed.createComponent(App);
        expect(getElementHtml(fixture.nativeElement)).toContain(
          '<projection>Content</projection><projection>Fallback</projection>',
        );
      },
    );

    it(
      'should render the fallback content when an instance of a component that uses ' +
        'fallback content is declared before one that does not',
      () => {
        @Component({
          selector: 'projection',
          template: `<ng-content>Fallback</ng-content>`,
        })
        class Projection {}

        @Component({
          imports: [Projection],
          template: `
            <projection/>
            <projection>Content</projection>
          `,
        })
        class App {}

        const fixture = TestBed.createComponent(App);
        expect(getElementHtml(fixture.nativeElement)).toContain(
          '<projection>Fallback</projection><projection>Content</projection>',
        );
      },
    );
  });
});
