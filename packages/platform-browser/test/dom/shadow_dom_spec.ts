/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, createApplication} from '../../index';
import {expect} from '@angular/private/testing/matchers';
import {isNode} from '@angular/private/testing';

describe('ShadowDOM Support', () => {
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TestModule]});
  });

  afterEach(() => {
    for (const node of document.body.childNodes) node.remove();
  });

  it('should attach and use a shadowRoot when ViewEncapsulation.ShadowDom is set', () => {
    const compEl = TestBed.createComponent(ShadowComponent).nativeElement;
    expect(compEl.shadowRoot!.textContent).toEqual('Hello World');
  });

  it('should use the shadow root to encapsulate styles', () => {
    const compEl = TestBed.createComponent(StyledShadowComponent).nativeElement;
    // Firefox and Chrome return different computed styles. Chrome supports CSS property
    // shorthands in the computed style object while Firefox expects explicit CSS properties.
    // e.g. we can't use the "border" CSS property for this test as "border" is a shorthand
    // property and therefore would not work within Firefox.
    expect(window.getComputedStyle(compEl).backgroundColor).toEqual('rgb(0, 0, 0)');
    const redDiv = compEl.shadowRoot.querySelector('div.red');
    expect(window.getComputedStyle(redDiv).backgroundColor).toEqual('rgb(255, 0, 0)');
  });

  it('should allow the usage of <slot> elements', () => {
    const el = TestBed.createComponent(ShadowSlotComponent).nativeElement;
    const projectedContent = document.createTextNode('Hello Slot!');
    el.appendChild(projectedContent);
    const slot = el.shadowRoot!.querySelector('slot');

    expect(slot!.assignedNodes().length).toBe(1);
    expect(slot!.assignedNodes()[0].textContent).toBe('Hello Slot!');
  });

  it('should allow the usage of named <slot> elements', () => {
    const el = TestBed.createComponent(ShadowSlotsComponent).nativeElement;

    const headerContent = document.createElement('h1');
    headerContent.setAttribute('slot', 'header');
    headerContent.textContent = 'Header Text!';

    const articleContent = document.createElement('span');
    articleContent.setAttribute('slot', 'article');
    articleContent.textContent = 'Article Text!';

    const articleSubcontent = document.createElement('span');
    articleSubcontent.setAttribute('slot', 'article');
    articleSubcontent.textContent = 'Article Subtext!';

    el.appendChild(headerContent);
    el.appendChild(articleContent);
    el.appendChild(articleSubcontent);

    const headerSlot = el.shadowRoot!.querySelector('slot[name=header]') as HTMLSlotElement;
    const articleSlot = el.shadowRoot!.querySelector('slot[name=article]') as HTMLSlotElement;

    expect(headerSlot!.assignedNodes().length).toBe(1);
    expect(headerSlot!.assignedNodes()[0].textContent).toBe('Header Text!');
    expect(headerContent.assignedSlot).toBe(headerSlot);

    expect(articleSlot!.assignedNodes().length).toBe(2);
    expect(articleSlot!.assignedNodes()[0].textContent).toBe('Article Text!');
    expect(articleSlot!.assignedNodes()[1].textContent).toBe('Article Subtext!');
    expect(articleContent.assignedSlot).toBe(articleSlot);
    expect(articleSubcontent.assignedSlot).toBe(articleSlot);
  });

  it('should support bootstrapping under a shadow root', async () => {
    @Component({
      selector: 'app-root',
      template: '<div>Hello, World!</div>',
      styles: `
        div {
          color: red;
        }
      `,
    })
    class Root {}

    const container = document.createElement('div');
    container.attachShadow({mode: 'open'});
    const root = document.createElement('app-root');
    container.shadowRoot!.append(root);
    document.body.append(container);

    const appRef = await createApplication();
    appRef.bootstrap(Root, root);

    expect(getComputedStyle(root.querySelector('div')!).color).toBe('rgb(255, 0, 0)');

    expect(document.head.innerHTML).not.toContain('<style>');

    appRef.destroy();

    expect(container.shadowRoot!.innerHTML).not.toContain('<style>');
  });

  it('should support bootstrapping multiple root components under different shadow roots', async () => {
    const appRef = await createApplication();

    {
      @Component({
        selector: 'app-root',
        template: '<div>Hello, World!</div>',
        styles: `
          div {
            color: red;
          }
        `,
      })
      class Root {}

      const container = document.createElement('div');
      container.attachShadow({mode: 'open'});
      const root = document.createElement('app-root');
      container.shadowRoot!.append(root);
      document.body.append(container);

      appRef.bootstrap(Root, root);
      expect(getComputedStyle(root.querySelector('div')!).color).toBe('rgb(255, 0, 0)');
    }

    {
      @Component({
        selector: 'app-root-2',
        template: '<div>Hello, World!</div>',
        styles: `
          div {
            color: lime;
          }
        `,
      })
      class Root {}

      const container = document.createElement('div');
      container.attachShadow({mode: 'open'});
      const root = document.createElement('app-root-2');
      container.shadowRoot!.append(root);
      document.body.append(container);

      appRef.bootstrap(Root, root);
      expect(getComputedStyle(root.querySelector('div')!).color).toBe('rgb(0, 255, 0)');
    }

    expect(document.head.innerHTML).not.toContain('<style>');

    appRef.destroy();

    const containers = Array.from(document.querySelectorAll('div'));
    const [shadowRoot1, shadowRoot2] = containers.map((container) => container.shadowRoot!);
    expect(shadowRoot1.innerHTML).not.toContain('<style>');
    expect(shadowRoot2.innerHTML).not.toContain('<style>');
  });

  it('should support bootstrapping multiple root components under the same shadow root', async () => {
    const container = document.createElement('div');
    container.attachShadow({mode: 'open'});
    document.body.append(container);

    const appRef = await createApplication();

    @Component({
      selector: 'app-root',
      template: '<div>Hello, World!</div>',
      styles: `
        div {
          color: red;
        }
      `,
    })
    class Root {}

    const rootEl = document.createElement('app-root');
    container.shadowRoot!.append(rootEl);

    const root = appRef.bootstrap(Root, rootEl);
    expect(container.shadowRoot!.innerHTML).toContain('color: red;');
    expect(getComputedStyle(rootEl.querySelector('div')!).color).toBe('rgb(255, 0, 0)');

    @Component({
      selector: 'app-root-2',
      template: '<div>Hello, World!</div>',
      styles: `
        div {
          color: lime;
        }
      `,
    })
    class Root2 {}

    const root2El = document.createElement('app-root-2');
    container.shadowRoot!.append(root2El);

    const root2 = appRef.bootstrap(Root2, root2El);
    expect(container.shadowRoot!.innerHTML).toContain('color: lime;');
    expect(getComputedStyle(root2El.querySelector('div')!).color).toBe('rgb(0, 255, 0)');

    expect(document.head.innerHTML).not.toContain('<style>');

    root.destroy();
    expect(container.shadowRoot!.innerHTML).not.toContain('color: red;');
    expect(getComputedStyle(root2El.querySelector('div')!).color).toBe('rgb(0, 255, 0)');

    root2.destroy();
    expect(container.shadowRoot!.innerHTML).not.toContain('color: lime;');

    appRef.destroy();
  });

  it('should not leak styles into previously used shadow roots', async () => {
    const container1 = document.createElement('div');
    container1.attachShadow({mode: 'open'});
    document.body.append(container1);

    const container2 = document.createElement('div');
    container2.attachShadow({mode: 'open'});
    document.body.append(container2);

    const appRef = await createApplication();

    {
      @Component({
        selector: 'app-root',
        template: '<div>Hello, World!</div>',
        styles: `
          div {
            color: red;
          }
        `,
      })
      class Root {}

      const rootEl = document.createElement('app-root');
      container1.shadowRoot!.append(rootEl);

      const root = appRef.bootstrap(Root, rootEl);
      expect(getComputedStyle(rootEl.querySelector('div')!).color).toBe('rgb(255, 0, 0)');
      root.destroy();

      expect(container1.shadowRoot!.innerHTML).not.toContain('<style>');
    }

    {
      @Component({
        selector: 'app-root-2',
        template: '<div>Hello, World!</div>',
        styles: `
          div {
            color: lime;
          }
        `,
      })
      class Root2 {}

      const root2El = document.createElement('app-root-2');
      container2.shadowRoot!.append(root2El);

      const root = appRef.bootstrap(Root2, root2El);
      expect(getComputedStyle(root2El.querySelector('div')!).color).toBe('rgb(0, 255, 0)');

      // Should not leak into `container1`.
      expect(container1.shadowRoot!.innerHTML).not.toContain('<style>');

      root.destroy();
    }

    appRef.destroy();
  });
});

@Component({
  selector: 'shadow-comp',
  template: 'Hello World',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class ShadowComponent {}

@Component({
  selector: 'styled-shadow-comp',
  template: '<div class="red"></div>',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      :host {
        background: black;
      }
      .red {
        background: red;
      }
    `,
  ],
  standalone: false,
})
class StyledShadowComponent {}

@Component({
  selector: 'shadow-slot-comp',
  template: '<slot></slot>',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class ShadowSlotComponent {}

@Component({
  selector: 'shadow-slots-comp',
  template:
    '<header><slot name="header"></slot></header><article><slot name="article"></slot></article>',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class ShadowSlotsComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [ShadowComponent, ShadowSlotComponent, ShadowSlotsComponent, StyledShadowComponent],
})
class TestModule {
  ngDoBootstrap() {}
}
