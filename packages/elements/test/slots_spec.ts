/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, destroyPlatform, EventEmitter, Input, NgModule, Output, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {createCustomElement, NgElement} from '../src/create-custom-element';


// we only run these tests in browsers that support Shadom DOM slots natively
if (browserDetection.supportsCustomElements && browserDetection.supportsShadowDom) {
  describe('slots', () => {
    let testContainer: HTMLDivElement;

    beforeAll(done => {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
      destroyPlatform();
      platformBrowserDynamic()
          .bootstrapModule(TestModule)
          .then(ref => {
            const injector = ref.injector;
            const cfr: ComponentFactoryResolver = injector.get(ComponentFactoryResolver);

            testElements.forEach(comp => {
              const compFactory = cfr.resolveComponentFactory(comp);
              customElements.define(compFactory.selector, createCustomElement(comp, {injector}));
            });
          })
          .then(done, done.fail);
    });

    afterAll(() => {
      destroyPlatform();
      testContainer.remove();
      (testContainer as any) = null;
    });

    it('should use slots to project content', () => {
      const tpl = `<default-slot-el><span class="projected"></span></default-slot-el>`;
      testContainer.innerHTML = tpl;
      const testEl = testContainer.querySelector('default-slot-el')!;
      const content = testContainer.querySelector('span.projected')!;
      const slot = testEl.shadowRoot!.querySelector('slot')!;
      const assignedNodes = slot.assignedNodes();
      expect(assignedNodes[0]).toBe(content);
    });

    it('should use a named slot to project content', () => {
      const tpl = `<named-slot-el><span class="projected" slot="header"></span></named-slot-el>`;
      testContainer.innerHTML = tpl;
      const testEl = testContainer.querySelector('named-slot-el')!;
      const content = testContainer.querySelector('span.projected')!;
      const slot = testEl.shadowRoot!.querySelector('slot[name=header]') as HTMLSlotElement;
      const assignedNodes = slot.assignedNodes();
      expect(assignedNodes[0]).toBe(content);
    });

    it('should use named slots to project content', () => {
      const tpl = `
      <named-slots-el>
        <span class="projected-header" slot="header"></span>
        <span class="projected-body" slot="body"></span>
      </named-slots-el>`;
      testContainer.innerHTML = tpl;
      const testEl = testContainer.querySelector('named-slots-el')!;
      const headerContent = testContainer.querySelector('span.projected-header')!;
      const bodyContent = testContainer.querySelector('span.projected-body')!;
      const headerSlot = testEl.shadowRoot!.querySelector('slot[name=header]') as HTMLSlotElement;
      const bodySlot = testEl.shadowRoot!.querySelector('slot[name=body]') as HTMLSlotElement;

      expect(headerContent.assignedSlot).toBe(headerSlot);
      expect(bodyContent.assignedSlot).toBe(bodySlot);
    });

    it('should listen to slotchange events', (done) => {
      const templateEl = document.createElement('template');
      const tpl = `
      <slot-events-el>
        <span class="projected">Content</span>
      </slot-events-el>`;
      templateEl.innerHTML = tpl;
      const template = templateEl.content.cloneNode(true) as DocumentFragment;
      const testEl = template.querySelector('slot-events-el')! as NgElement & SlotEventsComponent;
      testEl.addEventListener('slotEventsChange', e => {
        expect(testEl.slotEvents.length).toEqual(1);
        done();
      });
      testContainer.appendChild(template);
      expect(testEl.slotEvents.length).toEqual(0);
    });
  });
}

// Helpers
@Component({
  selector: 'default-slot-el',
  template: '<div class="slotparent"><slot></slot></div>',
  encapsulation: ViewEncapsulation.ShadowDom
})
class DefaultSlotComponent {
  constructor() {}
}

@Component({
  selector: 'named-slot-el',
  template: '<div class="slotparent"><slot name="header"></slot></div>',
  encapsulation: ViewEncapsulation.ShadowDom
})
class NamedSlotComponent {
  constructor() {}
}

@Component({
  selector: 'named-slots-el',
  template: '<div class="slotparent"><slot name="header"></slot><slot name="body"></slot></div>',
  encapsulation: ViewEncapsulation.ShadowDom
})
class NamedSlotsComponent {
  constructor() {}
}

@Component({
  selector: 'slot-events-el',
  template: '<slot (slotchange)="onSlotChange($event)"></slot>',
  encapsulation: ViewEncapsulation.ShadowDom
})
class SlotEventsComponent {
  @Input() slotEvents: Event[] = [];
  @Output() slotEventsChange = new EventEmitter();
  constructor() {}
  onSlotChange(event: Event) {
    this.slotEvents.push(event);
    this.slotEventsChange.emit(event);
  }
}

const testElements =
    [DefaultSlotComponent, NamedSlotComponent, NamedSlotsComponent, SlotEventsComponent];

@NgModule({imports: [BrowserModule], declarations: testElements, entryComponents: testElements})
class TestModule {
  ngDoBootstrap() {}
}
