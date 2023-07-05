/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, computed, ContentChild, contentChild, contentChildren, ElementRef, ViewChild, viewChild, ViewChildren, viewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('queries', () => {
  describe('view queries', () => {
    it('should support child query in a single view', () => {
      @Component({
        signals: true,
        standalone: true,
        template: `<div #el></div>`,
      })
      class App {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the viewChild function _and_ @ViewChild annotation?
        @ViewChild('el') divEl = viewChild<ElementRef>('el');
        foundEl = computed(() => this.divEl() != null);
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });

    it('should support children query in a single view', () => {
      @Component({
        signals: true,
        standalone: true,
        template: `
          <div #el1></div>
          <div #el2></div>
        `,
      })
      class App {
        @ViewChildren('el1,el2') divEls = viewChildren<ElementRef>('el1,el2');
        foundEl = computed(() => this.divEls().length === 2);
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });
  });

  describe('content queries', () => {
    it('should support child query in a single view ', () => {
      @Component({
        selector: 'with-content',
        signals: true,
        standalone: true,
        template: `{{foundEl()}}`,
      })
      class WithContent {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the contentChild function _and_ @ContentChild
        // annotation?
        @ContentChild('el') divEl = contentChild<ElementRef<HTMLDivElement>>('el');
        foundEl = computed(() => this.divEl() != null);
      }

      @Component({
        signals: true,
        standalone: true,
        imports: [WithContent],
        template: `<with-content><div #el></div></with-content>`,
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('true');
    });

    it('should support child queries in a single view ', () => {
      @Component({
        selector: 'with-content',
        signals: true,
        standalone: true,
        template: `{{elCount()}}`,
      })
      class WithContent {
        // Q1: similar to input, do we allow people to "observe" moment before assigning by throwing
        // if it is not set? Or return null / undefined? Do static queries make sense in this
        // context?
        // Q2: similar to input, do we need both the contentChild function _and_ @ContentChild
        // annotation?
        @ContentChild('el') divEl = contentChildren<ElementRef<HTMLDivElement>>('el');
        elCount = computed(() => this.divEl().length);
      }

      @Component({
        signals: true,
        standalone: true,
        imports: [WithContent],
        template: `
          <with-content>
            <div #el></div>
            <div #el></div>
          </with-content>`,
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('2');
    });
  });
});
