/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, computed, ElementRef, ViewChild, viewChild, viewChildren} from '@angular/core';
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
        template: `<div #el1><div><div #el2><div>`,
      })
      class App {
        @ViewChild('el1,el2') divEls = viewChildren<ElementRef>('el');
        foundEl = computed(() => this.divEls().length === 2);
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();
    });
  });
});
