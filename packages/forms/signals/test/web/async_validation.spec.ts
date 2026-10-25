/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, resource, Resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick, waitFor} from '@angular/private/testing';
import {applyEach, form, FormField, validateAsyncLoader, validateResource} from '../../public_api';

for (const kind of ['loader', 'resource'] as const) {
  describe(`${kind} validation with FormField`, () => {
    useAutoTick();

    it('should render pending/errors from input events and reload with current params', async () => {
      const requests: {params: string; resolve: (value: boolean) => void}[] = [];
      const loader = ({params}: {params: string}) =>
        new Promise<boolean>((resolve) => requests.push({params, resolve}));
      @Component({
        imports: [FormField],
        template: `<input [formField]="f.username" /><span>{{
            f.username().pending() ? 'pending' : f.username().invalid() ? 'invalid' : 'valid'
          }}</span>`,
      })
      class Registration {
        readonly model = signal({username: 'initial'});
        readonly f = form(this.model, (p) => {
          const options = {
            params: ({value}: {value: () => string}) => value(),
            loader,
            onSuccess: (available: boolean) => (available ? undefined : {kind: 'taken'}),
            onError: () => ({kind: 'failed'}),
          };
          if (kind === 'loader') validateAsyncLoader(p.username, options);
          else
            validateResource(p.username, {
              ...options,
              factory: (params: Resource<string | undefined>) =>
                resource<boolean, string | undefined>({
                  params: ({chain}) => chain(params),
                  loader,
                }),
            });
        });
      }
      const fixture = TestBed.createComponent(Registration);
      await waitFor(() => throwUnless(requests.length).toBe(1));
      requests[0].resolve(true);
      await fixture.whenStable();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const status = () => fixture.nativeElement.querySelector('span').textContent;
      expect(status()).toBe('valid');
      input.value = 'updated';
      input.dispatchEvent(new Event('input'));
      await waitFor(() => throwUnless(requests.length).toBe(2));
      expect(requests[1].params).toBe('updated');
      expect(status()).toBe('pending');
      requests[1].resolve(false);
      await fixture.whenStable();
      expect(status()).toBe('invalid');
      expect(fixture.componentInstance.f.username().errors()).toEqual([
        {kind: 'taken', fieldTree: fixture.componentInstance.f.username},
      ]);
      fixture.componentInstance.f.username().reloadValidation();
      await waitFor(() => throwUnless(requests.length).toBe(3));
      expect(requests[2].params).toBe('updated');
      requests[2].resolve(true);
      await fixture.whenStable();
      expect(status()).toBe('valid');
    });

    it('should release a removed field while validation is pending', async () => {
      let aborted = false;
      const loader = ({abortSignal}: {abortSignal: AbortSignal}) =>
        new Promise<boolean>((resolve) => {
          abortSignal.addEventListener('abort', () => {
            aborted = true;
            resolve(true);
          });
        });
      @Component({
        imports: [FormField],
        template: `@for (item of f; track item) {
          <input [formField]="item.name" />
        }`,
      })
      class Registration {
        readonly model = signal([{name: 'initial'}]);
        readonly f = form(this.model, (p) =>
          applyEach(p, (item) => {
            const options = {
              params: ({value}: {value: () => string}) => value(),
              loader,
              onSuccess: () => undefined,
              onError: () => undefined,
            };
            if (kind === 'loader') validateAsyncLoader(item.name, options);
            else
              validateResource(item.name, {
                ...options,
                factory: (params: Resource<string | undefined>) =>
                  resource<boolean, string | undefined>({
                    params: ({chain}) => chain(params),
                    loader,
                  }),
              });
          }),
        );
      }
      const fixture = TestBed.createComponent(Registration);
      await timeout(0);
      fixture.componentInstance.model.set([]);
      await fixture.whenStable();
      expect(aborted).toBeTrue();
      expect(fixture.nativeElement.querySelector('input')).toBeNull();
      expect(fixture.componentInstance.f().pending()).toBeFalse();
    });
  });
}
