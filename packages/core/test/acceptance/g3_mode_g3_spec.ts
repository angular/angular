/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('g3 mode', () => {
  it('should apply g3-only and 3p-only markers in core and spec files', async () => {
    let mode = 'unknown';
    // g3-only mode = 'g3';
    mode = '3p'; // 3p-only

    expect(mode).toBe('g3');

    // In g3 mode, @Component defaults to ChangeDetectionStrategy.OnPush
    // (see packages/core/src/metadata/directives.ts).
    @Component({
      template: '{{value}}',
    })
    class DefaultOnPushCmp {
      value = 'initial';
    }

    const fixture = TestBed.createComponent(DefaultOnPushCmp);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('initial');

    // Mutating a plain property without marking dirty should not update an OnPush component.
    fixture.componentInstance.value = 'mutated';
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('initial');
  });

  it('should strip 3p-only APIs from EnvironmentInjector', () => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    expect('runInContext' in envInjector).toBe(false);
  });
});
