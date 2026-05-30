/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../src/core';
import {TestBed} from '../../testing';

describe('expressions', () => {
  it('should support nullish coalescing operator', async () => {
    // Nullish should not pass a null value (as hinted by the TCB)
    // https://github.com/angular/angular/issues/37622

    @Component({
      template: `{{ method(prop?.field) === undefined }}`,
    })
    class App {
      prop: {field: string} | undefined = undefined;
      method(param: string | undefined) {
        // unexpected null should never happen
        return param === null ? 'unexpected null' : param;
      }
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toEqual('true');
  });

  it('should return null for safe calls when using the $safeNavigationMigration magic function', async () => {
    @Component({
      template: `{{ method($safeNavigationMigration(prop?.field)) }}`,
    })
    class App {
      prop: {field: string} | undefined = undefined;
      method(param: string | undefined) {
        // unexpected null should never happen
        return param === null ? 'unexpected null' : param;
      }
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toEqual('unexpected null');
  });
});
