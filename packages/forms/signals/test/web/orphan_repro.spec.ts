/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {applyEach, debounce, form, FormField, validateAsync} from '../../public_api';

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
  it('should handle debounceSync resolving after the field is orphaned', async () => {
    let resolveDebounce!: () => void;
    const debouncePromise = new Promise<void>((r) => {
      resolveDebounce = r;
    });

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
      readonly f = form(this.model, (p) => {
        applyEach(p.items, (item) => {
          debounce(item.name, () => debouncePromise);
        });
      });
    }

    const fixture = TestBed.createComponent(ReproCmp);
    const appRef = TestBed.inject(ApplicationRef);
    await appRef.whenStable();

    const input1 = fixture.nativeElement.querySelector('#input-1') as HTMLInputElement;
    expect(input1).toBeTruthy();
    document.body.appendChild(fixture.nativeElement);

    // 1. Simulate user typing to trigger debounceSync
    input1.value = 'changed';
    input1.dispatchEvent(new Event('input'));

    // 2. Delete the item from the model immediately, before debounce resolves
    fixture.componentInstance.model.update((m) => ({
      items: m.items.slice(0, 1), // Remove 'two'
    }));

    // 3. Resolve the debounce promise.
    resolveDebounce();

    // 4. Wait for everything to settle and verify no crash.
    try {
      await appRef.whenStable();
    } catch (e: any) {
      fail(
        'Expected test not to throw error during debounce sync, but it threw: ' +
          e.message +
          '\n' +
          e.stack,
      );
    } finally {
      document.body.removeChild(fixture.nativeElement);
    }
  });
  it('should handle validateAsync resolving after the field is orphaned', async () => {
    const validationResolvers: ((value: any) => void)[] = [];
    const validationPromises: Promise<any>[] = [];

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
      readonly f = form(this.model, (p) => {
        applyEach(p.items, (item) => {
          validateAsync(item.name, {
            params: (ctx) => ctx.value(),
            factory: (params) =>
              resource({
                params,
                loader: ({abortSignal}) => {
                  const p = new Promise<any>((resolve, reject) => {
                    validationResolvers.push(resolve);
                    abortSignal.addEventListener('abort', () => {
                      reject(new Error('Aborted'));
                    });
                  });
                  validationPromises.push(p);
                  return p;
                },
              }),
            onSuccess: (results, ctx) => {
              const path = ctx.pathKeys().join('.');
              return results ? [] : [{kind: 'async-invalid', message: 'Failed at ' + path}];
            },
            onError: () => null,
          });
        });
      });
    }

    const fixture = TestBed.createComponent(ReproCmp);
    const appRef = TestBed.inject(ApplicationRef);
    // Run initial CD synchronously to render the inputs and trigger validation loaders
    appRef.tick();

    // We expect 2 resolvers to be registered now (one for 'one', one for 'two')
    expect(validationResolvers.length).toBe(2);
    expect(validationPromises.length).toBe(2);

    const input1 = fixture.nativeElement.querySelector('#input-1') as HTMLInputElement;
    expect(input1).toBeTruthy();

    // 1. Delete the item from the model immediately, while validation is loading
    fixture.componentInstance.model.update((m) => ({
      items: m.items.slice(0, 1), // Remove 'two'
    }));
    // Force CD synchronously to trigger structure removal and orphan the node
    appRef.tick();

    // 2. Resolve both validation promises to flush microtasks and clear the tasks
    for (const resolve of validationResolvers) {
      resolve(false);
    }

    // Await the promises themselves to flush microtasks (pattern from form_field.spec.ts)
    for (const p of validationPromises) {
      try {
        await p;
      } catch (e) {
        // Ignore expected abort rejections
      }
    }

    // 3. Force change detection to trigger any onSuccess evaluations and verify no crash.
    // Note: We avoid appRef.whenStable() here to prevent deadlocks caused by known upstream stability-tracking bugs
    // in the experimental resource() API when dynamic transitions to idle occur.
    try {
      appRef.tick();
    } catch (e: any) {
      fail(
        'Expected test not to throw error during async validation resolution, but it threw: ' +
          e.message +
          '\n' +
          e.stack,
      );
    }
  });
});
