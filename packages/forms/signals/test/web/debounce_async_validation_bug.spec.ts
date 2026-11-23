/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, debounced, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick} from '@angular/private/testing';

import {form, FormField, validateAsync} from '../../public_api';

describe('debounced inside validateAsync bug', () => {
  useAutoTick();

  it('should not throw a cycle error when using debounced in validateAsync factory', async () => {
    const loads: string[] = [];

    @Component({
      template: ` <input [formField]="form.hello" /> `,
      imports: [FormField],
    })
    class DebounceBug {
      protected readonly model = signal({
        hello: 'world',
      });

      readonly form = form(this.model, (path) => {
        validateAsync(path.hello, {
          params: ({value}) => value(),
          factory: (params) => {
            const debounce = debounced(params, 300);
            return resource({
              params: ({chain}) => chain(debounce),
              loader: async ({params}) => {
                loads.push(params);
                return new Promise<string>((resolve) =>
                  setTimeout(() => {
                    resolve('hi');
                  }, 400),
                );
              },
            });
          },
          onSuccess: (response) => null,
          onError: (error) => null,
        });
      });
    }

    const fixture = TestBed.createComponent(DebounceBug);
    await fixture.whenStable();
    const hello = fixture.componentInstance.form.hello;
    expect(loads).toEqual(['world']);
    expect(hello().pending()).toBeFalse();

    // In a "zoneless and async-first" testing environment, just need to change something and wait
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'hello!';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(hello().value()).toBe('hello!');
    expect(hello().pending()).toBeTrue();

    // `debounced()` doesn't register a pending task, so `whenStable()` doesn't wait for it.
    await timeout(300);
    await fixture.whenStable();
    expect(loads).toEqual(['world', 'hello!']);
    expect(hello().pending()).toBeFalse();
    expect(hello().valid()).toBeTrue();
  });
});
