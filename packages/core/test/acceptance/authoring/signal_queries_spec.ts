/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO: update imports
import {Component, computed} from '@angular/core';
import {viewChild} from '@angular/core/src/authoring/queries';
import {getComponentDef} from '@angular/core/src/render3/definition';
import {TestBed} from '@angular/core/testing';

describe('queries as signals', () => {
  describe('view', () => {
    // TODO: Enable when `viewChild` is exposed publicly. Right now, compiler will
    // not detect `viewChild` as it does not originate from a `@angular/core` import.
    xit('view child', () => {
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
