/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, FormField} from '../../public_api';

describe('Signal Forms array removal orphan repro', () => {
  it('should not throw orphan field error when a focused input in an array is removed', async () => {
    @Component({
      imports: [FormField],
      template: `
        <div>
          @for (child of f.items; track $index) {
            <input [formField]="child.name" [id]="'input-' + $index" />
          }
        </div>
      `,
    })
    class ReproCmp {
      readonly model = signal({
        items: [{name: 'one'}, {name: 'two'}],
      });
      readonly f = form(this.model);
    }

    TestBed.configureTestingModule({
      imports: [ReproCmp],
    });

    const fixture = TestBed.createComponent(ReproCmp);
    const appRef = TestBed.inject(ApplicationRef);

    // Initial render
    await appRef.whenStable();

    const input1 = fixture.nativeElement.querySelector('#input-1') as HTMLInputElement;
    expect(input1).toBeTruthy();

    // Attach to body to ensure real focus/blur events behave correctly
    document.body.appendChild(fixture.nativeElement);

    // 1. Focus the second input (item 'two')
    let blurFired = false;
    input1.addEventListener('blur', () => {
      blurFired = true;
    });
    input1.focus();
    expect(document.activeElement).toBe(input1);

    // 2. Delete the second item from the model array
    fixture.componentInstance.model.update((m) => ({
      items: m.items.slice(0, 1), // Remove 'two', leaving only 'one'
    }));

    // 3. Manually dispatch blur event to simulate browser behavior where
    // removing an active element from the DOM fires 'blur' synchronously.
    input1.dispatchEvent(new Event('blur'));

    // 4. Wait for change detection and DOM removal.
    try {
      await appRef.whenStable();
    } catch (e: any) {
      fail('Expected test not to throw error, but it threw: ' + e.message + '\n' + e.stack);
    } finally {
      // Clean up DOM
      document.body.removeChild(fixture.nativeElement);
    }
  });
});
