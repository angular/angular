/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ComponentFactoryResolver,
  destroyPlatform,
  Input,
  NgModule,
  ViewEncapsulation,
} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {createCustomElement} from '../src/create-custom-element';

const tick = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe('Reconnect', () => {
  let testContainer: HTMLDivElement;

  beforeAll(async () => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
    const ref = await platformBrowser().bootstrapModule(TestModule);
    const injector = ref.injector;
    const cfr: ComponentFactoryResolver = injector.get(ComponentFactoryResolver);

    testElements.forEach((comp) => {
      const compFactory = cfr.resolveComponentFactory(comp);
      customElements.define(compFactory.selector, createCustomElement(comp, {injector}));
    });
  });

  afterAll(() => {
    destroyPlatform();
    testContainer.remove();
  });

  it('should be able to rebuild and reconnect after direct disconnection from parent', async () => {
    // Create and attach it
    const tpl = `<reconnect-el test-attr="a"></reconnect-el>`;
    testContainer.innerHTML = tpl;
    // Check that the Angular element was created and attributes are bound
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe('a');
    // Check that the Angular element was bound to properties too
    const testEl = testContainer.querySelector<Element & ReconnectTestComponentEl>('reconnect-el')!;
    testEl.testProp = 'b';
    // Wait change to be propagated
    await tick(10);
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe('b');
    // Now detach the element from the container
    testContainer.removeChild(testEl);
    // Wait for detach timer
    await tick(10);
    // Check that the web-element is orphan and the Angular Component is destroyed
    expect(testEl.parentElement).toBeFalsy();
    // Check property values to be maintained
    expect(testEl.testProp).toBe('b');

    // Now reattach root to testContainer
    testContainer.appendChild(testEl);
    // Check for re-render, but with the same instance of web-element
    expect(
      testContainer.querySelectorAll<Element & ReconnectTestComponentEl>('reconnect-el').length,
    ).toBe(1);
    expect(
      testContainer.querySelectorAll<Element & ReconnectTestComponentEl>('.reconnect-el').length,
    ).toBe(1);
    expect(testContainer.querySelectorAll('.test-attr-outlet').length).toBe(1);
    expect(testContainer.querySelectorAll('.test-prop-outlet').length).toBe(1);
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe('a');
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe('b');
  });

  it('should be able to rebuild and reconnect after indirect disconnection via parent node', async () => {
    const tpl = `<div class="root"><reconnect-el test-attr="a"></reconnect-el></div>`;
    testContainer.innerHTML = tpl;
    const root = testContainer.querySelector<HTMLDivElement>('.root')!;
    // Check that the Angular element was created and attributes are bound
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe('a');
    // Check that the Angular element was bound to properties too
    const testEl = testContainer.querySelector<Element & ReconnectTestComponentEl>('reconnect-el')!;
    testEl.testProp = 'b';
    // Wait change to be propagated
    await tick(10);
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe('b');

    // Now detach the root from the DOM
    testContainer.removeChild(root);
    // Wait for detach timer
    await tick(10);
    // Check that the web-element is still under root, but the Angular Component is destroyed
    expect(testEl.parentElement).toBe(root);
    // Check property values to be maintained
    expect(testEl.testProp).toBe('b');

    // Now reattach root to testContainer
    testContainer.appendChild(root);
    // Check for re-render, but with the same instance of web-element
    expect(testContainer.querySelector<Element & ReconnectTestComponentEl>('reconnect-el')).toBe(
      testEl,
    );
    expect(
      testContainer.querySelectorAll<Element & ReconnectTestComponentEl>('reconnect-el').length,
    ).toBe(1);
    expect(
      testContainer.querySelectorAll<Element & ReconnectTestComponentEl>('.reconnect-el').length,
    ).toBe(1);
    expect(testContainer.querySelectorAll('.test-attr-outlet').length).toBe(1);
    expect(testContainer.querySelectorAll('.test-prop-outlet').length).toBe(1);
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe('a');
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe('b');
  });

  it('should be able to rebuild and reconnect after indirect disconnection via parent node, with slots', async () => {
    const tpl = `<div class="root"><reconnect-slotted-el><span class="projected"></span></reconnect-slotted-el></div>`;
    testContainer.innerHTML = tpl;
    const root = testContainer.querySelector<HTMLDivElement>('.root')!;
    const testEl = testContainer.querySelector('reconnect-slotted-el')!;

    // Check that the Angular element was created and slots are projected
    {
      const content = testContainer.querySelector('span.projected')!;
      const slot = testEl.shadowRoot!.querySelector('slot') as HTMLSlotElement;
      const assignedNodes = slot.assignedNodes();
      expect(assignedNodes[0]).toBe(content);
    }

    // Now detach the root from the DOM
    testContainer.removeChild(root);
    // Wait for detach timer
    await tick(10);

    // Check that the web-element is still under root, but the Angular Component is destroyed
    expect(testEl.parentElement).toBe(root);

    // Now reattach root to testContainer
    testContainer.appendChild(root);
    // Check for re-render, but with the same instance of web-element
    expect(testContainer.querySelectorAll('reconnect-slotted-el').length).toBe(1);
    expect(testEl.shadowRoot!.querySelectorAll('.reconnect-slotted-el').length).toBe(1);

    // Check that the Angular element was re-created and slots are still projected
    {
      const content = testContainer.querySelector('span.projected')!;
      const slot = testEl.shadowRoot!.querySelector('slot') as HTMLSlotElement;
      const assignedNodes = slot.assignedNodes();
      expect(assignedNodes[0]).toBe(content);
    }
  });
});

interface ReconnectTestComponentEl {
  testProp: string;
}

@Component({
  selector: 'reconnect-el',
  template:
    '<div class="reconnect-el"><p class="test-prop-outlet">{{testProp}}</p><p class="test-attr-outlet">{{testAttr}}</p></div>',
  standalone: false,
})
class ReconnectTestComponent implements ReconnectTestComponentEl {
  @Input() testAttr: string = '';
  @Input() testProp: string = '';
  constructor() {}
}

@Component({
  selector: 'reconnect-slotted-el',
  template: '<div class="reconnect-slotted-el"><slot></slot></div>',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class ReconnectSlottedTestComponent {
  constructor() {}
}

const testElements = [ReconnectTestComponent, ReconnectSlottedTestComponent];

@NgModule({imports: [BrowserModule], declarations: testElements})
class TestModule {
  ngDoBootstrap() {}
}
