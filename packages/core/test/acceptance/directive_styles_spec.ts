/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, Directive, ViewEncapsulation} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {isBrowser} from '@angular/private/testing';

// We're scoping the test to browser targets because Domino's getComputedStyle implementation
// is unreliable and does't reflect the actual computed style in browsers

isBrowser &&
  describe('directive styles', () => {
    function getAllHostAttrs(element: HTMLElement): string[] {
      return Array.from(element.attributes)
        .map((a) => a.name)
        .filter((a) => a.startsWith('_nghost-'));
    }

    function getStyleForHostAttr(doc: Document, hostAttr: string): string | undefined {
      const styles = Array.from(doc.querySelectorAll('style'));
      const matching = styles.find((style) => style.textContent?.includes(hostAttr));
      return matching?.textContent ?? undefined;
    }

    it('should apply styles scoped to the host element from a directive', async () => {
      @Directive({
        selector: '[myDir]',
        styles: [':host { color: red; }'],
      })
      class MyDir {}

      @Component({
        template: '<div myDir>Hello</div>',
        imports: [MyDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const hostAttrs = getAllHostAttrs(div);
      expect(hostAttrs.length).toBe(1);

      const styleContent = getStyleForHostAttr(doc, hostAttrs[0]);
      expect(styleContent).toBeDefined();
      expect(styleContent).toContain(`[${hostAttrs[0]}]`);
      expect(styleContent).toContain('color: red');

      expect(getComputedStyle(div).color).toBe('rgb(255, 0, 0)');
    });

    it('should scope element selectors in directive styles to the host element', async () => {
      @Directive({
        selector: '[dirWithElementSelector]',
        styles: ['div { color: red; } span { color: green; }'],
      })
      class DirWithElementSelector {}

      @Component({
        template: '<div dirWithElementSelector><span>Child text</span></div>',
        imports: [DirWithElementSelector],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const span = fixture.nativeElement.querySelector('span') as HTMLElement;

      const hostAttrs = getAllHostAttrs(div);
      expect(hostAttrs.length).toBe(1);

      // Child span must NOT have the directive host attribute
      const spanHostAttrs = getAllHostAttrs(span);
      expect(spanHostAttrs.length).toBe(0);

      const styleContent = getStyleForHostAttr(doc, hostAttrs[0]);
      expect(styleContent).toBeDefined();
      // Element selectors are shimmed with the host attribute
      expect(styleContent).toContain(`div[${hostAttrs[0]}]`);
      expect(styleContent).toContain(`span[${hostAttrs[0]}]`);

      expect(getComputedStyle(div).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(span).color).not.toBe('rgb(0, 128, 0)');
    });

    it('should support :host(.class) selector in directive styles', async () => {
      @Directive({
        selector: '[activeDir]',
        styles: [':host(.active) { color: red; }'],
      })
      class ActiveDir {}

      @Component({
        template: `
          <div activeDir class="active" id="active">Active</div>
          <div activeDir id="inactive">Inactive</div>
        `,
        imports: [ActiveDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const activeDiv = fixture.nativeElement.querySelector('#active') as HTMLElement;
      const inactiveDiv = fixture.nativeElement.querySelector('#inactive') as HTMLElement;

      const hostAttrs = getAllHostAttrs(activeDiv);
      expect(hostAttrs.length).toBe(1);
      expect(getAllHostAttrs(inactiveDiv)).toEqual(hostAttrs);

      const styleContent = getStyleForHostAttr(doc, hostAttrs[0]);
      expect(styleContent).toBeDefined();
      expect(styleContent).toContain(`.active[${hostAttrs[0]}]`);

      expect(getComputedStyle(activeDiv).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(inactiveDiv).color).not.toBe('rgb(255, 0, 0)');
    });

    it('should apply styles from multiple directives on the same host element', async () => {
      @Directive({
        selector: '[dirColor]',
        styles: [':host { color: red; }'],
      })
      class DirColor {}

      @Directive({
        selector: '[dirBg]',
        styles: [':host { background-color: blue; }'],
      })
      class DirBg {}

      @Component({
        template: '<div dirColor dirBg>Multi-directive host</div>',
        imports: [DirColor, DirBg],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const hostAttrs = getAllHostAttrs(div);
      expect(hostAttrs.length).toBe(2);

      const styleA = getStyleForHostAttr(doc, hostAttrs[0]);
      const styleB = getStyleForHostAttr(doc, hostAttrs[1]);
      expect(styleA).toBeDefined();
      expect(styleB).toBeDefined();

      expect(getComputedStyle(div).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(div).backgroundColor).toBe('rgb(0, 0, 255)');
    });

    it('should apply styles when both component and directive have styles on the same host element', async () => {
      @Directive({
        selector: '[borderDir]',
        styles: [':host { background: red; }'],
      })
      class BorderDir {}

      @Component({
        selector: 'child-comp',
        template: 'Child content',
        styles: [':host { color: green; }'],
      })
      class ChildComp {}

      @Component({
        template: '<child-comp borderDir/>',
        imports: [ChildComp, BorderDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const childEl = fixture.nativeElement.querySelector('child-comp') as HTMLElement;
      const hostAttrs = getAllHostAttrs(childEl);
      expect(hostAttrs.length).toBe(2);

      const styleComp = getStyleForHostAttr(doc, hostAttrs[0]);
      const styleDir = getStyleForHostAttr(doc, hostAttrs[1]);
      expect(styleComp).toBeDefined();
      expect(styleDir).toBeDefined();

      expect(getComputedStyle(childEl).color).toBe('rgb(0, 128, 0)');
      expect(getComputedStyle(childEl).backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should apply styles from hostDirectives', async () => {
      @Directive({
        styles: [':host { letter-spacing: 4px; }'],
      })
      class StyleDir {}

      @Directive({
        selector: '[composedDir]',
        hostDirectives: [StyleDir],
      })
      class ComposedDir {}

      @Component({
        template: '<div composedDir>Composed</div>',
        imports: [ComposedDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const hostAttrs = getAllHostAttrs(div);
      expect(hostAttrs.length).toBe(1);

      const styleContent = getStyleForHostAttr(doc, hostAttrs[0]);
      expect(styleContent).toBeDefined();
      expect(styleContent).toContain(`[${hostAttrs[0]}]`);
      expect(styleContent).toContain('letter-spacing: 4px');

      expect(getComputedStyle(div).letterSpacing).toBe('4px');
    });

    it('should accept styles as a single string', async () => {
      @Directive({
        selector: '[stringStylesDir]',
        styles: ':host { color: purple; }',
      })
      class StringStylesDir {}

      @Component({
        template: '<span stringStylesDir>Text</span>',
        imports: [StringStylesDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const span = fixture.nativeElement.querySelector('span') as HTMLElement;
      const hostAttrs = getAllHostAttrs(span);
      expect(hostAttrs.length).toBe(1);

      const styleContent = getStyleForHostAttr(doc, hostAttrs[0]);
      expect(styleContent).toBeDefined();
      expect(styleContent).toContain(`[${hostAttrs[0]}]`);
      expect(styleContent).toContain('color: purple');

      expect(getComputedStyle(span).color).toBe('rgb(128, 0, 128)');
    });

    it('should apply global styles with ViewEncapsulation.None without host attributes', async () => {
      @Directive({
        selector: '[myNoneDir]',
        styles: ['.global-dir-unique-class { color: rgb(123, 45, 67); }'],
        encapsulation: ViewEncapsulation.None,
      })
      class MyNoneDir {}

      @Component({
        template: `
          <div myNoneDir>
            <span class="global-dir-unique-class">Inside</span>
          </div>
          <span class="global-dir-unique-class">Outside</span>
        `,
        imports: [MyNoneDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const insideSpan = fixture.nativeElement.querySelector('div > span') as HTMLElement;
      const outsideSpan = fixture.nativeElement.querySelectorAll('span')[1] as HTMLElement;

      // ViewEncapsulation.None should not apply host attributes
      const hostAttrs = getAllHostAttrs(div);
      expect(hostAttrs.length).toBe(0);

      const allStyles = Array.from(doc.querySelectorAll('style'));
      const matching = allStyles.find((s) => s.textContent?.includes('.global-dir-unique-class'));
      expect(matching).toBeDefined();
      // Should NOT contain any host attribute selector
      expect(matching!.textContent).toContain(
        '.global-dir-unique-class { color: rgb(123, 45, 67); }',
      );
      expect(matching!.textContent).not.toContain('_nghost-');

      expect(getComputedStyle(insideSpan).color).toBe('rgb(123, 45, 67)');
      expect(getComputedStyle(outsideSpan).color).toBe('rgb(123, 45, 67)');
    });

    it('should allow combining ViewEncapsulation.None directive with Emulated directive on same element', async () => {
      @Directive({
        selector: '[noneDir]',
        styles: ['.combo-none-class { text-decoration: underline; }'],
        encapsulation: ViewEncapsulation.None,
      })
      class NoneDir {}

      @Directive({
        selector: '[emulatedDir]',
        styles: [':host { border-left: 3px solid rgb(0, 0, 255); }'],
      })
      class EmulatedDir {}

      @Component({
        template: '<div noneDir emulatedDir class="combo-none-class">Mixed</div>',
        imports: [NoneDir, EmulatedDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const hostAttrs = getAllHostAttrs(div);
      // Only the emulated directive adds a host attribute
      expect(hostAttrs.length).toBe(1);

      expect(getComputedStyle(div).borderLeftWidth).toBe('3px');
      expect(getComputedStyle(div).textDecorationLine).toMatch(/underline/);
    });

    it('should insert ViewEncapsulation.None directive styles only once across multiple instances', async () => {
      @Directive({
        selector: '[multiNoneDir]',
        styles: ['.multi-none-test-rule { line-height: 28px; }'],
        encapsulation: ViewEncapsulation.None,
      })
      class MultiNoneDir {}

      @Component({
        template: '<div multiNoneDir>1</div><div multiNoneDir>2</div>',
        imports: [MultiNoneDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const allStyles = Array.from(doc.querySelectorAll('style'));
      const matching = allStyles.filter((s) => s.textContent?.includes('.multi-none-test-rule'));
      expect(matching.length).toBe(1);
    });

    it('should distinguish between :host and element selectors for directive styles', async () => {
      @Directive({
        selector: '[matchDir]',
        // :host unconditionally matches the host.
        // `span` and `div` conditionally match the host only if it is of that tag.
        styles: [
          ':host { border-width: 2px; border-style: solid; } span { color: blue; } div { color: red; }',
        ],
      })
      class MatchDir {}

      @Component({
        template: `
          <div matchDir>Div host</div>
          <span matchDir>Span host</span>
        `,
        imports: [MatchDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const doc = TestBed.inject(DOCUMENT);
      const div = fixture.nativeElement.querySelector('div') as HTMLElement;
      const span = fixture.nativeElement.querySelector('span') as HTMLElement;

      // Both get the :host styles unconditionally
      expect(getComputedStyle(div).borderWidth).toBe('2px');
      expect(getComputedStyle(span).borderWidth).toBe('2px');

      // The element selectors only match when the host element has that tag
      expect(getComputedStyle(div).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(span).color).toBe('rgb(0, 0, 255)');
    });
  });
