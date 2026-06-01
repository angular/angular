/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, signal, viewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ForeignComponent} from '../../../src/interface/foreign_component';
import {foreignImport} from '../../../src/render3/foreign_import';

function frameworkImport<TProps>(component: (props: TProps) => Node[]): ForeignComponent<TProps> {
  return foreignImport((props) => [component(props)]);
}

function FancyButton(props: {children: Node[]}): Node[] {
  const button = document.createElement('button');
  for (const child of props.children) {
    button.appendChild(child);
  }
  return [button];
}

// TODO: support this inline.
function InnerComp(props: {renderHeader: (innerMsg: string) => Node[]; children: Node[]}): Node[] {
  const inner = document.createElement('div');
  inner.className = 'inner';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'inner-header';
  const headerNodes = props.renderHeader('Inner Msg');
  for (const child of headerNodes) {
    headerDiv.appendChild(child);
  }
  inner.appendChild(headerDiv);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'inner-body';
  for (const child of props.children) {
    bodyDiv.appendChild(child);
  }
  inner.appendChild(bodyDiv);

  return [inner];
}

describe('foreign components', () => {
  describe('content projection', () => {
    it('should update foreign content', async () => {
      @Component({
        selector: 'test-cmp',
        template: `
          <FancyButton>
            <span id="icon">{{ buttonIcon() }}</span>
          </FancyButton>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestUpdateForeignContent {
        readonly buttonIcon = signal('⭐');
      }

      const fixture = TestBed.createComponent(TestUpdateForeignContent);
      await fixture.whenStable();

      const icon = fixture.nativeElement.querySelector('#icon');
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('⭐');

      fixture.componentInstance.buttonIcon.set('🔥');
      await fixture.whenStable();

      expect(icon.textContent).toBe('🔥');
    });

    it('should not reparent content to next to its original container when added to the DOM', async () => {
      @Component({
        selector: 'test-cmp',
        template: `
          @if (true) {
            <FancyButton>
              <span>⭐</span>
            </FancyButton>
          }
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestNoReparenting {}

      const fixture = TestBed.createComponent(TestNoReparenting);

      // Change detection triggers insertion of the @if view, which contains the foreign component.
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          // The container in which @content is initially rendered.
          '<!--container-->' +
          // The start of the foreign view created for the foreign component.
          '<!--foreign-view-head-->' +
          '<button>' +
          '<span>⭐</span>' +
          '</button>' +
          // The end of the foreign view created for the foreign component.
          '<!--foreign-view-tail-->' +
          // The container in which the foreign view is rendered.
          '<!--foreign-component-->' +
          // The container anchor for the @if block.
          '<!--container-->',
      );
    });

    it('should support multiple @content blocks', async () => {
      function Card(props: {header: Node[]; children: Node[]; footer: Node[]}): Node[] {
        const card = document.createElement('div');
        card.className = 'card';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'header';
        for (const child of props.header) {
          headerDiv.appendChild(child);
        }
        card.appendChild(headerDiv);

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'body';
        for (const child of props.children) {
          bodyDiv.appendChild(child);
        }
        card.appendChild(bodyDiv);

        const footerDiv = document.createElement('div');
        footerDiv.className = 'footer';
        for (const child of props.footer) {
          footerDiv.appendChild(child);
        }
        card.appendChild(footerDiv);

        return [card];
      }

      @Component({
        selector: 'test-cmp',
        template: `
          <Card>
            @content(header) {
              <h1>My Title</h1>
            }
            <p>Card body content</p>
            @content(footer) {
              <button>Close</button>
            }
          </Card>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(Card)],
      })
      class TestMultiContent {}

      const fixture = TestBed.createComponent(TestMultiContent);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toContain(
        '' +
          // The start of the foreign view created for the foreign component.
          '<!--foreign-view-head-->' +
          '<div class="card">' +
          '<div class="header">' +
          '<h1>My Title</h1>' +
          '</div>' +
          '<div class="body">' +
          '<p>Card body content</p>' +
          '</div>' +
          '<div class="footer">' +
          '<button>Close</button>' +
          '</div>' +
          '</div>' +
          // The end of the foreign view created for the foreign component.
          '<!--foreign-view-tail-->' +
          // The container in which the foreign view is rendered.
          '<!--foreign-component-->',
      );
    });

    it('should support conditional (@if) in projected foreign content', async () => {
      @Component({
        selector: 'test-cmp',
        template: `
          <FancyButton>
            @if (show()) {
              <span id="status">Active</span>
            } @else {
              <span id="status">Inactive</span>
            }
          </FancyButton>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestConditionalForeignContent {
        readonly show = signal(true);
      }

      const fixture = TestBed.createComponent(TestConditionalForeignContent);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Active');
      expect(button.textContent).not.toContain('Inactive');

      fixture.componentInstance.show.set(false);
      await fixture.whenStable();

      expect(button.textContent).toContain('Inactive');
      expect(button.textContent).not.toContain('Active');
    });

    it('should support loops (@for) in projected foreign content', async () => {
      @Component({
        selector: 'test-cmp',
        template: `
          <FancyButton>
            @for (item of items(); track item) {
              <span class="item">{{ item }}</span>
            }
          </FancyButton>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestForLoopForeignContent {
        readonly items = signal(['A', 'B', 'C']);
      }

      const fixture = TestBed.createComponent(TestForLoopForeignContent);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();

      let items = button.querySelectorAll('.item');
      expect(items.length).toBe(3);
      expect(items[0].textContent).toBe('A');
      expect(items[1].textContent).toBe('B');
      expect(items[2].textContent).toBe('C');

      // 1. Reorder and remove
      fixture.componentInstance.items.set(['C', 'A']);
      await fixture.whenStable();

      items = button.querySelectorAll('.item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toBe('C');
      expect(items[1].textContent).toBe('A');

      // 2. Add new item
      fixture.componentInstance.items.set(['C', 'D', 'A']);
      await fixture.whenStable();

      items = button.querySelectorAll('.item');
      expect(items.length).toBe(3);
      expect(items[0].textContent).toBe('C');
      expect(items[1].textContent).toBe('D');
      expect(items[2].textContent).toBe('A');
    });

    it('should support projecting a foreign component into a foreign component', async () => {
      function SimpleWrapper(props: {children: Node[]}): Node[] {
        const div = document.createElement('div');
        div.className = 'wrapper';
        for (const child of props.children) {
          div.appendChild(child);
        }
        return [div];
      }

      @Component({
        selector: 'test-cmp',
        template: `
          <SimpleWrapper>
            <FancyButton>
              <span id="text">Inside wrapper button</span>
            </FancyButton>
          </SimpleWrapper>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(SimpleWrapper), frameworkImport(FancyButton)],
      })
      class TestNestedForeignComponents {}

      const fixture = TestBed.createComponent(TestNestedForeignComponents);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          '<!--container-->' + // @content(children) (implicit)
          '<!--foreign-view-head-->' + // <SimpleWrapper>
          '<div class="wrapper">' +
          '<!--container-->' + // @content(children) (implicit)
          '<!--foreign-component-->' + // TODO: fix after https://github.com/angular/angular/pull/69099.
          '<!--foreign-view-head-->' + // <FancyButton>
          '<button>' +
          '<span id="text">Inside wrapper button</span>' +
          '</button>' +
          '<!--foreign-view-tail-->' + // </FancyButton>
          '</div>' +
          '<!--foreign-view-tail-->' + // </SimpleWrapper>
          '<!--foreign-component-->',
      );
    });

    it('should support projecting a foreign component into an Angular component', async () => {
      @Component({
        selector: 'angular-wrapper',
        template: `<ng-content />`,
      })
      class AngularWrapper {}

      @Component({
        selector: 'test-cmp',
        imports: [AngularWrapper],
        template: `
          <angular-wrapper>
            <FancyButton>
              <span id="text">Inside Angular</span>
            </FancyButton>
          </angular-wrapper>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestProjectForeignIntoAngular {}

      const fixture = TestBed.createComponent(TestProjectForeignIntoAngular);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          '<angular-wrapper>' +
          '<!--container-->' +
          '<!--foreign-view-head-->' +
          '<button>' +
          '<span id="text">Inside Angular</span>' +
          '</button>' +
          '<!--foreign-view-tail-->' +
          '<!--foreign-component-->' +
          '</angular-wrapper>',
      );
    });

    it('should support zero parameter callback', async () => {
      function FancyList(props: {renderHeader: () => Node[]}): Node[] {
        const div = document.createElement('div');
        const headerNodes = props.renderHeader();

        for (const node of headerNodes) {
          div.appendChild(node);
        }

        return [div];
      }

      @Component({
        selector: 'test-cmp',
        template: `
          <FancyList>
            @content(renderHeader; let _) {
              <span>Header Content</span>
            }
          </FancyList>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyList)],
      })
      class TestNoParamContentFn {}

      const fixture = TestBed.createComponent(TestNoParamContentFn);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          '<!--container-->' + // for @content(renderHeader)
          '<!--foreign-view-head-->' +
          '<div><span>Header Content</span></div>' +
          '<!--foreign-view-tail-->' +
          '<!--foreign-component-->',
      );
    });

    it('should support a single parameter callback', async () => {
      function FancyList(props: {renderItem: (item: string) => Node[]}): Node[] {
        const div = document.createElement('div');
        const itemNodes = props.renderItem('Hello Single');

        for (const node of itemNodes) {
          div.appendChild(node);
        }

        return [div];
      }

      @Component({
        selector: 'test-cmp',
        template: `
          <FancyList>
            @content(renderItem; let item) {
              <span>{{ item }}</span>
            }
          </FancyList>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyList)],
      })
      class TestOneParamContentFn {}

      const fixture = TestBed.createComponent(TestOneParamContentFn);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          '<!--container-->' + // for @content(renderItem)
          '<!--foreign-view-head-->' +
          '<div><span>Hello Single</span></div>' +
          '<!--foreign-view-tail-->' +
          '<!--foreign-component-->',
      );
    });

    it('should support multiple parameter callback', async () => {
      function FancyTable(props: {
        renderRow: (row: string, index: number, isLast: boolean) => Node[];
      }): Node[] {
        const div = document.createElement('div');
        const nodes = props.renderRow('RowA', 0, false);

        for (const node of nodes) {
          div.appendChild(node);
        }

        return [div];
      }

      @Component({
        selector: 'test-cmp',
        template: `
          <FancyTable>
            @content(renderRow; let row, idx, isLast) {
              <span>{{ idx }} - {{ row }} (Last: {{ isLast }})</span>
            }
          </FancyTable>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyTable)],
      })
      class TestManyParamsContentFn {}

      const fixture = TestBed.createComponent(TestManyParamsContentFn);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          '<!--container-->' + // for @content(renderRow)
          '<!--foreign-view-head-->' +
          '<div><span>0 - RowA (Last: false)</span></div>' +
          '<!--foreign-view-tail-->' +
          '<!--foreign-component-->',
      );
    });

    it('should support nested callbacks', async () => {
      function OuterComp(props: {renderContent: (msg: string) => Node[]}): Node[] {
        const outer = document.createElement('div');
        outer.className = 'outer';
        const nodes = props.renderContent('Outer Msg');
        for (const node of nodes) {
          outer.appendChild(node);
        }
        return [outer];
      }

      @Component({
        selector: 'test-cmp',
        template: `
          <OuterComp>
            @content(renderContent; let message) {
              <InnerComp>
                @content(renderHeader; let innerMessage) {
                  {{ message }} - {{ innerMessage }}
                }
                Body Content
              </InnerComp>
            }
          </OuterComp>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(OuterComp), frameworkImport(InnerComp)],
      })
      class TestDeepNestedContentFn {}

      const fixture = TestBed.createComponent(TestDeepNestedContentFn);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toBe(
        '' +
          '<!--container-->' + // @content(renderContent)
          '<!--foreign-view-head-->' + // <OuterComp>
          '<div class="outer">' +
          '<!--container-->' + // @content(renderHeader)
          '<!--container-->' + // @content(children) (implicit)
          '<!--foreign-component-->' + // TODO: fix after https://github.com/angular/angular/pull/69099.
          '<!--foreign-view-head-->' + // <InnerComp>
          '<div class="inner">' +
          '<div class="inner-header"> Outer Msg - Inner Msg </div>' +
          '<div class="inner-body"> Body Content </div>' +
          '</div>' +
          '<!--foreign-view-tail-->' + // </InnerComp>
          '</div>' +
          '<!--foreign-view-tail-->' + // </OuterComp>
          '<!--foreign-component-->',
      );
    });
  });

  describe('queries', () => {
    it('should support querying elements inside projected foreign content', async () => {
      @Component({
        selector: 'test-cmp',
        template: `
          <FancyButton>
            @if (show()) {
              <span #target id="icon">⭐</span>
            }
          </FancyButton>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestQueryForeignContent {
        readonly show = signal(true);
        readonly targets = viewChildren<ElementRef<HTMLSpanElement>>('target');
      }

      const fixture = TestBed.createComponent(TestQueryForeignContent);
      await fixture.whenStable();

      expect(fixture.componentInstance.targets().length).toBe(1);
      expect(fixture.componentInstance.targets()[0].nativeElement.id).toBe('icon');

      fixture.componentInstance.show.set(false);
      await fixture.whenStable();

      expect(fixture.componentInstance.targets().length).toBe(0);

      fixture.componentInstance.show.set(true);
      await fixture.whenStable();

      expect(fixture.componentInstance.targets().length).toBe(1);
      expect(fixture.componentInstance.targets()[0].nativeElement.id).toBe('icon');
    });
  });

  describe('event handlers', () => {
    it('should support event handlers on elements inside projected foreign content', async () => {
      let clicked = false;

      @Component({
        selector: 'test-cmp',
        template: `
          <FancyButton>
            <span id="icon" (click)="handleClick()">⭐</span>
          </FancyButton>
        `,
        // @ts-ignore
        foreignImports: [frameworkImport(FancyButton)],
      })
      class TestEventForeignContent {
        handleClick() {
          clicked = true;
        }
      }

      const fixture = TestBed.createComponent(TestEventForeignContent);
      await fixture.whenStable();

      const icon = fixture.nativeElement.querySelector('#icon');
      expect(icon).toBeTruthy();
      expect(clicked).toBeFalse();

      icon.click();
      await fixture.whenStable();

      expect(clicked).toBeTrue();
    });
  });
});
