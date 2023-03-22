/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {signal} from '../../src/signals';

describe('CheckAlways components', () => {
  it('can read a signal', () => {
    @Component({
      template: `{{value()}}`,
      standalone: true,
    })
    class CheckAlwaysCmp {
      value = signal('initial');
    }
    const fixture = TestBed.createComponent(CheckAlwaysCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial');

    fixture.componentInstance.value.set('new');
    fixture.detectChanges();
    expect(instance.value()).toBe('new');
  });

  it('is not "shielded" by a non-dirty OnPush parent', () => {
    const value = signal('initial');
    @Component({
      template: `{{value()}}`,
      standalone: true,
      selector: 'check-always',
    })
    class CheckAlwaysCmp {
      value = value;
    }
    @Component({
      template: `<check-always />`,
      standalone: true,
      imports: [CheckAlwaysCmp],
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class OnPushParent {
    }
    const fixture = TestBed.createComponent(OnPushParent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial');

    value.set('new');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('new');
  });
});
