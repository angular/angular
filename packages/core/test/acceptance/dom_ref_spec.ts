/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PLATFORM_BROWSER_ID} from '@angular/common/src/platform_id';
import {Component, DomRef, PLATFORM_ID, afterNextRender, inject, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('DomRef', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}],
    });
  });

  it('should initially throw', () => {
    @Component({
      template: ``,
      standalone: true,
    })
    class MyComp {
      elRef = inject(DomRef<HTMLElement>);

      constructor() {
        this.elRef();
      }
    }

    expect(() => {
      TestBed.createComponent(MyComp);
    }).toThrowError(/Attempted to read DomRef before it was ready/);
  });

  it('should return the native element in afterRender', async () => {
    @Component({
      template: ``,
      standalone: true,
    })
    class MyComp {
      elRef = inject(DomRef<HTMLElement>);
      el: HTMLElement | null = null;

      constructor() {
        afterNextRender(() => {
          this.el = this.elRef();
        });
      }
    }

    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();

    expect(fixture.componentInstance.el).not.toBe(null);
    expect(fixture.componentInstance.el).toBe(fixture.nativeElement);
  });
});
