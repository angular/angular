/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, type FieldTree} from '../../public_api';

describe('field proxy', () => {
  it('@for over array field should be reactive', () => {
    @Component({
      selector: 'iterate-field',
      template: `@for (i of f(); track i) {
        <p>hi</p>
      }`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class IterateFieldCmp {
      f = input.required<FieldTree<number[]>>();
    }

    @Component({
      template: `
        <iterate-field [f]="f" />
        <button (click)="add()">add</button>
      `,
      imports: [IterateFieldCmp],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ParentCmp {
      f = form(signal([0]));

      add() {
        this.f().value.update((v) => [...v, v.length]);
      }
    }

    const fix = act(() => TestBed.createComponent(ParentCmp));
    expect(fix.nativeElement.querySelectorAll('p').length).toBe(1);

    const btn = fix.nativeElement.querySelector('button');
    act(() => btn.click());
    expect(fix.nativeElement.querySelectorAll('p').length).toBe(2);
  });
});

function act<T>(fn: () => T): T {
  try {
    return fn();
  } finally {
    TestBed.tick();
  }
}
