/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, computed, viewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('queries as signals', () => {
  describe('view', () => {
    it('view child', () => {
      @Component({
        selector: 'test-cmp',
        standalone: true,
        template: '<div #el></div>',
      })
      class AppComponent {
        divEl = viewChild('el');
        foundEl = computed(() => this.divEl() != null);
      }

      const fixture = TestBed.createComponent(AppComponent);
      // with signal based queries we _do_ have query results after the creation mode execution
      // (before the change detection runs) so we can return those early on! In this sense all
      // queries behave as "static" (?)
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      fixture.detectChanges();
      expect(fixture.componentInstance.foundEl()).toBeTrue();

      // non-required query results are undefined before we run creation mode on the view queries
      const appCmpt = new AppComponent();
      expect(appCmpt.divEl()).toBeUndefined();
    });
  });
});
