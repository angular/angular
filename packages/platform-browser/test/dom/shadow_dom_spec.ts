/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, NgModule, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, ISOLATED_SHADOW_DOM} from '../../index';
import {expect} from '../../testing/src/matchers';

describe('ShadowDOM Support', () => {
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TestModule]});
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

  it('should inject None shared styles in web elements', () => {
    const comp = TestBed.createComponent(ShadowInjectedComponent);
    const compEl = comp.nativeElement as HTMLElement;
    const div = compEl.shadowRoot!.querySelector('div.green')!;
    // Not set before creating a sibling component
    expect(window.getComputedStyle(div).color).toEqual('rgb(0, 0, 0)');
    expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(1); // one <style> element
    // Add NoneStyleComponent
    const compInstance = comp.componentInstance;
    const viewContainerRef = compInstance.viewContainerRef;
    viewContainerRef.createComponent(NoneStyleComponent);
    expect(window.getComputedStyle(div).color).toEqual('rgb(0, 128, 0)'); // green
    expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(2); // two <style> elements
  });

  it('should inject Emulated shared styles in web elements', () => {
    const comp = TestBed.createComponent(ShadowInjectedComponent);
    const compEl = comp.nativeElement as HTMLElement;
    const div = compEl.shadowRoot!.querySelector('div.yellow')!;
    // Not set before creating a sibling component
    expect(window.getComputedStyle(div).color).toEqual('rgb(0, 0, 0)');
    expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(1); // one <style> element
    // Add EmulatedStyleComponent
    const compInstance = comp.componentInstance;
    const viewContainerRef = compInstance.viewContainerRef;
    viewContainerRef.createComponent(EmulatedStyleComponent);
    expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(2); // two <style> elements
  });

  describe('should not inject shared styles in shadow dom when `ISOLATED_SHADOW_DOM` is `true`', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [BrowserModule],
        declarations: [
          StyledShadowComponent,
          NoneStyleComponent,
          EmulatedStyleComponent,
          ShadowInjectedComponent,
        ],
        providers: [
          {
            provide: ISOLATED_SHADOW_DOM,
            useValue: true,
          },
        ],
      });
    });

    it('should not inject None shared styles in web elements', () => {
      const comp = TestBed.createComponent(ShadowInjectedComponent);
      const compEl = comp.nativeElement as HTMLElement;
      const div = compEl.shadowRoot!.querySelector('div.green')!;
      // Not set before creating a sibling component
      expect(window.getComputedStyle(div).color).toEqual('rgb(0, 0, 0)');
      expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(1); // one <style> element
      // Add NoneStyleComponent
      const compInstance = comp.componentInstance;
      const viewContainerRef = compInstance.viewContainerRef;
      viewContainerRef.createComponent(NoneStyleComponent);
      expect(window.getComputedStyle(div).color).toEqual('rgb(0, 0, 0)');
      expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(1);
    });

    it('should not inject Emulated shared styles in web elements', () => {
      const comp = TestBed.createComponent(ShadowInjectedComponent);
      const compEl = comp.nativeElement as HTMLElement;
      const div = compEl.shadowRoot!.querySelector('div.yellow')!;
      // Not set before creating a sibling component
      expect(window.getComputedStyle(div).color).toEqual('rgb(0, 0, 0)');
      expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(1); // one <style> element
      // Add EmulatedStyleComponent
      const compInstance = comp.componentInstance;
      const viewContainerRef = compInstance.viewContainerRef;
      viewContainerRef.createComponent(EmulatedStyleComponent);
      expect(compEl.shadowRoot!.querySelectorAll('style').length).toEqual(1);
    });
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
  styles: [`:host { background: black; } .red { background: red; }`],
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

@Component({
  selector: 'shadow-inj-comp',
  template: '<div class="green yellow"></div>',
  styles: [`.green { background-color: green; } .yellow { background-color: yellow; }`],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class ShadowInjectedComponent {
  viewContainerRef = inject(ViewContainerRef);
}

@Component({
  selector: 'none-style-comp',
  template: '<div class="green"></div>',
  styles: [`.green { color: green; }`],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
class NoneStyleComponent {}

@Component({
  selector: 'emulated-style-comp',
  template: '<div class="yellow"></div>',
  styles: [`.yellow { color: yellow; }`],
  encapsulation: ViewEncapsulation.Emulated,
  standalone: false,
})
class EmulatedStyleComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [
    ShadowComponent,
    ShadowSlotComponent,
    ShadowSlotsComponent,
    StyledShadowComponent,
    NoneStyleComponent,
    EmulatedStyleComponent,
    ShadowInjectedComponent,
  ],
})
class TestModule {
  ngDoBootstrap() {}
}
