/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injector, input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';
import {
  apply,
  applyEach,
  applyWhen,
  applyWhenValue,
  debounce,
  disabled,
  form,
  hidden,
  link,
  max,
  readonly,
  required,
  schema,
  Schema,
  submit,
} from '../../../public_api';
import {compatForm} from '../../../compat';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

describe('link', () => {
  describe('reactive computation mode', () => {
    it('computes the initial linked value and syncs it to the model signal when effects flush', () => {
      const model = signal({quantity: 2, unitPrice: 10, total: 0});
      const orderForm = form(
        model,
        (p) => {
          link(p.total, ({valueOf}) => valueOf(p.quantity) * valueOf(p.unitPrice));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(orderForm.total().value()).toBe(20);
      expect(model().total).toBe(20);
    });

    it('updates when writing via field.value.set/update and controlValue.set after effects flush', () => {
      const model = signal({quantity: 2, unitPrice: 10, total: 0});
      const orderForm = form(
        model,
        (p) => {
          link(p.total, ({valueOf}) => valueOf(p.quantity) * valueOf(p.unitPrice));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      orderForm.quantity().value.set(5);
      TestBed.tick();
      expect(orderForm.total().value()).toBe(50);
      expect(model().total).toBe(50);

      orderForm.unitPrice().value.update((p) => p + 5);
      TestBed.tick();
      expect(orderForm.total().value()).toBe(75);
      expect(model().total).toBe(75);

      orderForm.quantity().controlValue.set(4);
      TestBed.tick();
      expect(orderForm.total().value()).toBe(60);
      expect(orderForm.quantity().dirty()).toBeTrue();
      // Default `fieldState: 'preserve'` does not mark linked field dirty.
      expect(orderForm.total().dirty()).toBeFalse();
    });

    it('updates when the root model signal is mutated directly after effects flush', () => {
      const model = signal({quantity: 2, unitPrice: 10, total: 0});
      const orderForm = form(
        model,
        (p) => {
          link(p.total, ({valueOf}) => valueOf(p.quantity) * valueOf(p.unitPrice));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      model.update((m) => ({...m, quantity: 7}));
      TestBed.tick();

      expect(orderForm.total().value()).toBe(70);
      expect(model().total).toBe(70);
    });

    it('reacts to external Angular signals', () => {
      const taxRate = signal(0.1);
      const model = signal({subtotal: 100, tax: 0});
      const f = form(
        model,
        (p) => {
          link(p.tax, ({valueOf}) => valueOf(p.subtotal) * taxRate());
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.tax().value()).toBe(10);

      taxRate.set(0.25);
      TestBed.tick();

      expect(f.tax().value()).toBe(25);
      expect(model().tax).toBe(25);
    });

    it('preserves manual edits until a tracked dependency changes (linkedSignal semantics)', () => {
      const model = signal({title: 'Hello World', slug: ''});
      const f = form(
        model,
        (p) => {
          link(p.slug, ({valueOf}) => slugify(valueOf(p.title)));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.slug().value()).toBe('hello-world');

      f.slug().controlValue.set('my-custom-slug');
      TestBed.tick();
      expect(f.slug().value()).toBe('my-custom-slug');

      TestBed.tick();
      expect(f.slug().value()).toBe('my-custom-slug');

      // Changing the tracked dependency resets the linked field again.
      f.title().value.set('Updated Title');
      TestBed.tick();
      expect(f.slug().value()).toBe('updated-title');
    });

    it('does not re-run when unrelated sibling fields change', () => {
      let calls = 0;
      const model = signal({first: 'Ada', last: 'Lovelace', full: '', notes: ''});
      const f = form(
        model,
        (p) => {
          link(p.full, ({valueOf}) => {
            calls++;
            return `${valueOf(p.first)} ${valueOf(p.last)}`;
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.full().value()).toBe('Ada Lovelace');
      const afterInit = calls;

      f.notes().value.set('changed note');
      TestBed.tick();
      expect(calls).toBe(afterInit);
    });

    it('batches multiple synchronous field writes into a single computation', () => {
      let calls = 0;
      const model = signal({qty: 1, price: 10, total: 0});
      const f = form(
        model,
        (p) => {
          link(p.total, ({valueOf}) => {
            calls++;
            return valueOf(p.qty) * valueOf(p.price);
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();
      expect(calls).toBe(1);

      f.qty().value.set(5);
      f.price().value.set(20);
      TestBed.tick();
      expect(f.total().value()).toBe(100);
      expect(calls).toBe(2);
    });

    it('works on a primitive root field', () => {
      const model = signal('  Hello  ');
      const f = form(
        model,
        (p) => {
          link(p, ({value}) => value().trim().toLowerCase());
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(model()).toBe('hello');

      f().value.set('  WORLD  ');
      TestBed.tick();
      expect(model()).toBe('world');
    });

    it('preserves initial value when on is "change"', () => {
      const model = signal({title: 'Old Title', slug: 'custom-seo-url'});
      const f = form(
        model,
        (p) => {
          link(p.slug, {
            source: ({valueOf}) => valueOf(p.title),
            computation: (title) => slugify(title),
            on: 'change',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.slug().value()).toBe('custom-seo-url');

      f.title().value.set('Brand New Title');
      TestBed.tick();
      expect(f.slug().value()).toBe('brand-new-title');
    });

    it('respects a custom `equal` comparator to avoid loops on objects and arrays', () => {
      const model = signal({tags: ['a', 'b', 'a']});
      const shallowArrayEq = (a: string[], b: string[]) =>
        a.length === b.length && a.every((v, i) => v === b[i]);

      const f = form(
        model,
        (p) => {
          link(p.tags, {
            source: ({value}) => value(),
            computation: (tags) => [...new Set(tags)],
            equal: shallowArrayEq,
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.tags().value()).toEqual(['a', 'b']);

      f.tags().value.set(['x', 'y', 'x', 'z']);
      TestBed.tick();
      expect(f.tags().value()).toEqual(['x', 'y', 'z']);
    });
  });

  describe('source-driven mode', () => {
    it('supports a LogicFn source with `on: "change"`', () => {
      const statesByCountry: Record<string, string[]> = {
        US: ['CA', 'NY'],
        CA: ['ON', 'QC'],
      };
      const model = signal({country: 'US', state: 'CA'});
      let computeCalls = 0;

      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: (country, {previous}) => {
              computeCalls++;
              return statesByCountry[country]?.includes(previous.value) ? previous.value : '';
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      // `computation` is not executed on init when `on: 'change'`.
      expect(computeCalls).toBe(0);
      expect(f.state().value()).toBe('CA');

      f.country().value.set('CA');
      TestBed.tick();
      expect(computeCalls).toBe(1);
      expect(f.state().value()).toBe('');
    });

    it('supports an external Angular Signal as source without passing extra arguments', () => {
      const defaultCurrency = signal('USD');
      const model = signal({currency: 'EUR'});

      const f = form(
        model,
        (p) => {
          link(p.currency, {
            source: defaultCurrency,
            on: 'change',
            computation: (c) => c,
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.currency().value()).toBe('EUR');

      defaultCurrency.set('GBP');
      TestBed.tick();
      expect(f.currency().value()).toBe('GBP');
    });

    it('executes `computation` untracked so reads inside it do not add extra triggers', () => {
      let computeCalls = 0;
      const model = signal({country: 'US', prefix: '', note: 'initial'});

      const f = form(
        model,
        (p) => {
          link(p.prefix, {
            source: ({valueOf}) => valueOf(p.country),
            computation: (country, {value, valueOf}) => {
              computeCalls++;
              // Both reads are intentionally untracked inside `computation`.
              return `${country}:${valueOf(p.note)}:${value().length}`;
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.prefix().value()).toBe('US:initial:0');
      expect(computeCalls).toBe(1);

      f.note().value.set('changed');
      f.prefix().value.set('manual');
      TestBed.tick();
      expect(computeCalls).toBe(1);
      expect(f.prefix().value()).toBe('manual');

      f.country().value.set('FR');
      TestBed.tick();
      expect(computeCalls).toBe(2);
      expect(f.prefix().value()).toBe('FR:changed:6');
    });

    it('passes `previous: undefined` on init when on is "always", and updates with manual edits', () => {
      const seenPrevious: Array<{source: string; value: string} | undefined> = [];
      const model = signal({country: 'US', label: 'initial'});

      const f = form(
        model,
        (p) => {
          link(p.label, {
            source: ({valueOf}) => valueOf(p.country),
            computation: (country, {previous}) => {
              seenPrevious.push(previous);
              return `country:${country}`;
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(seenPrevious).toEqual([undefined]);
      expect(f.label().value()).toBe('country:US');

      // Manual edit captured as `previous.value` on next source change.
      f.label().value.set('user-edited');
      f.country().value.set('DE');
      TestBed.tick();

      expect(seenPrevious).toEqual([undefined, {source: 'US', value: 'user-edited'}]);
      expect(f.label().value()).toBe('country:DE');
    });

    it('supports delta-based updates with previous.source and previous.value', () => {
      const day = 24 * 60 * 60 * 1000;
      const start = new Date('2026-06-01T00:00:00Z');
      const end = new Date('2026-06-05T00:00:00Z');
      const model = signal({startDate: start, endDate: end});

      const f = form(
        model,
        (p) => {
          link(p.endDate, {
            source: ({valueOf}) => valueOf(p.startDate),
            on: 'change',
            computation: (nextStart, {previous}) => {
              const durationMs = previous.value.getTime() - previous.source.getTime();
              return new Date(nextStart.getTime() + durationMs);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.endDate().value().getTime()).toBe(end.getTime());

      // Shift start forward 10 days -> end preserves 4-day trip duration.
      const nextStart = new Date(start.getTime() + 10 * day);
      f.startDate().value.set(nextStart);
      TestBed.tick();
      expect(f.endDate().value().getTime()).toBe(nextStart.getTime() + 4 * day);
    });

    it('supports reload-safe overridable slug using previous.source', () => {
      const hydratedModel = signal({title: 'Existing Post', slug: 'custom-seo-url'});
      const hydratedForm = form(
        hydratedModel,
        (p) => {
          link(p.slug, {
            source: ({valueOf}) => valueOf(p.title),
            on: 'change',
            computation: (title, {previous}) => {
              const wasAuto = previous.value === '' || previous.value === slugify(previous.source);
              return wasAuto ? slugify(title) : previous.value;
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      // Hydrated custom slug is kept even when title is edited.
      hydratedForm.title().value.set('Renamed Post');
      TestBed.tick();
      expect(hydratedForm.slug().value()).toBe('custom-seo-url');

      // New post starting with empty/auto slug updates automatically until customized.
      const newModel = signal({title: 'First Draft', slug: 'first-draft'});
      const newForm = form(
        newModel,
        (p) => {
          link(p.slug, {
            source: ({valueOf}) => valueOf(p.title),
            on: 'change',
            computation: (title, {previous}) => {
              const wasAuto = previous.value === '' || previous.value === slugify(previous.source);
              return wasAuto ? slugify(title) : previous.value;
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      newForm.title().value.set('Second Draft');
      TestBed.tick();
      expect(newForm.slug().value()).toBe('second-draft');

      newForm.slug().value.set('hand-picked');
      newForm.title().value.set('Third Draft');
      TestBed.tick();
      expect(newForm.slug().value()).toBe('hand-picked');
    });

    it('handles cascading type -> comparator -> value resets (issue #65467)', () => {
      const model = signal<{
        type: 'number' | 'date' | 'varchar';
        comparator: string;
        value: string;
      }>({
        type: 'number',
        comparator: 'gt',
        value: '42',
      });

      const f = form(
        model,
        (p) => {
          link(p.comparator, {
            source: ({valueOf}) => valueOf(p.type),
            on: 'change',
            fieldState: 'reset',
            computation: () => '',
          });
          link(p.value, {
            source: ({valueOf}) => `${valueOf(p.type)}|${valueOf(p.comparator)}`,
            on: 'change',
            fieldState: 'reset',
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.comparator().markAsDirty();
      f.comparator().markAsTouched();
      f.value().markAsDirty();
      f.value().markAsTouched();

      // Hydrated values stay intact initially.
      expect(f().value()).toEqual({type: 'number', comparator: 'gt', value: '42'});

      // Changing comparator resets value only.
      f.comparator().value.set('lt');
      TestBed.tick();
      expect(f.comparator().value()).toBe('lt');
      expect(f.value().value()).toBe('');
      expect(f.value().dirty()).toBeFalse();
      expect(f.value().touched()).toBeFalse();

      // Re-populate value and switch type -> resets both comparator and value.
      f.value().controlValue.set('100');
      f.type().value.set('varchar');
      TestBed.tick();
      expect(f.comparator().value()).toBe('');
      expect(f.comparator().dirty()).toBeFalse();
      expect(f.comparator().touched()).toBeFalse();
      expect(f.value().value()).toBe('');
      expect(f.value().dirty()).toBeFalse();
    });

    it('handles null and undefined values cleanly', () => {
      const model = signal<{trigger: string | null; target: string | null}>({
        trigger: null,
        target: 'initial',
      });

      const f = form(
        model,
        (p) => {
          link(p.target, {
            source: ({valueOf}) => valueOf(p.trigger),
            on: 'change',
            computation: (trigger) => (trigger === null ? null : `val:${trigger}`),
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.target().value()).toBe('initial');

      f.trigger().value.set('x');
      TestBed.tick();
      expect(f.target().value()).toBe('val:x');

      f.trigger().value.set(null);
      TestBed.tick();
      expect(f.target().value()).toBeNull();
    });
  });

  describe('when guard & fieldState modes', () => {
    it('stops linking once edited when guarded by `!state.dirty()` and resumes after reset()', () => {
      const model = signal({title: 'Hello', slug: ''});
      const f = form(
        model,
        (p) => {
          link(p.slug, {
            source: ({valueOf}) => valueOf(p.title),
            computation: (title) => slugify(title),
            when: ({state}) => !state.dirty(),
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.slug().value()).toBe('hello');
      expect(f.slug().dirty()).toBeFalse();

      f.title().value.set('Hello Angular');
      TestBed.tick();
      expect(f.slug().value()).toBe('hello-angular');

      // User edits slug -> controlValue marks it dirty.
      f.slug().controlValue.set('custom');
      TestBed.tick();
      expect(f.slug().dirty()).toBeTrue();

      f.title().value.set('Another Title');
      TestBed.tick();
      expect(f.slug().value()).toBe('custom');

      // Calling `reset()` clears dirty flag -> `when` turns true -> slug resyncs immediately.
      f.slug().reset();
      TestBed.tick();
      expect(f.slug().dirty()).toBeFalse();
      expect(f.slug().value()).toBe('another-title');
    });

    it('re-applies a constant value whenever `when` flips false -> true', () => {
      const model = signal({hasPromo: true, promoCode: 'SAVE10'});
      const f = form(
        model,
        (p) => {
          link(p.promoCode, {
            source: () => '',
            computation: () => '',
            when: ({valueOf}) => !valueOf(p.hasPromo),
            fieldState: 'reset',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.promoCode().value()).toBe('SAVE10');

      f.promoCode().markAsDirty();
      f.promoCode().markAsTouched();
      f.hasPromo().value.set(false);
      TestBed.tick();
      expect(f.promoCode().value()).toBe('');
      expect(f.promoCode().dirty()).toBeFalse();
      expect(f.promoCode().touched()).toBeFalse();

      // Re-enable promo, fill again, and disable again.
      f.hasPromo().value.set(true);
      f.promoCode().controlValue.set('VIP20');
      TestBed.tick();
      expect(f.promoCode().value()).toBe('VIP20');

      f.hasPromo().value.set(false);
      TestBed.tick();
      expect(f.promoCode().value()).toBe('');
    });

    it('mirrors an object while a checkbox is true and leaves it editable when unchecked', () => {
      const model = signal({
        sameAsShipping: false,
        shipping: {city: 'Paris', zip: '75001'},
        billing: {city: 'Lyon', zip: '69001'},
      });

      const f = form(
        model,
        (p) => {
          link(p.billing, {
            source: ({valueOf}) => valueOf(p.shipping),
            computation: (shipping) => ({...shipping}),
            when: ({valueOf}) => valueOf(p.sameAsShipping),
            equal: (a, b) => a.city === b.city && a.zip === b.zip,
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.billing().value()).toEqual({city: 'Lyon', zip: '69001'});

      f.sameAsShipping().value.set(true);
      TestBed.tick();
      expect(f.billing().value()).toEqual({city: 'Paris', zip: '75001'});

      f.shipping.city().value.set('Nice');
      TestBed.tick();
      expect(f.billing.city().value()).toBe('Nice');

      f.sameAsShipping().value.set(false);
      f.billing.city().value.set('Marseille');
      f.shipping.city().value.set('Bordeaux');
      TestBed.tick();
      expect(f.billing.city().value()).toBe('Marseille');
    });

    it('does not trigger `on: "change"` when `when` re-activates without source changing', () => {
      const model = signal({locked: false, country: 'US', state: 'CA'});
      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            when: ({valueOf}) => !valueOf(p.locked),
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.locked().value.set(true);
      f.locked().value.set(false);
      TestBed.tick();
      expect(f.state().value()).toBe('CA');
    });

    it('never evaluates `source` while `when` is false, safely guarding nullable inputs', () => {
      const model = signal<{customer: {id: string} | null; label: string}>({
        customer: null,
        label: 'initial',
      });
      const seenPrevSources: string[] = [];

      const f = form(
        model,
        (p) => {
          link(p.label, {
            source: ({valueOf}) => valueOf(p.customer)!.id,
            when: ({valueOf}) => valueOf(p.customer) !== null,
            on: 'change',
            computation: (id, {previous}) => {
              seenPrevSources.push(previous.source);
              return `customer:${id}`;
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.label().value()).toBe('initial');

      // First activation baselines `previous.source` to `'c1'` without clobbering `'initial'`.
      f.customer().value.set({id: 'c1'});
      TestBed.tick();
      expect(f.label().value()).toBe('initial');
      expect(seenPrevSources).toEqual([]);

      // Subsequent change runs `computation` with real `previous.source === 'c1'`.
      f.customer().value.set({id: 'c2'});
      TestBed.tick();
      expect(f.label().value()).toBe('customer:c2');
      expect(seenPrevSources).toEqual(['c1']);
    });

    it('resets dirty, touched, and controlValue for `fieldState: "reset"` even when derived value equals current value', () => {
      const model = signal<{type: string; amount: number | null}>({
        type: 'number',
        amount: null,
      });
      const f = form(
        model,
        (p) => {
          debounce(p.amount, () => new Promise<void>(() => {}));
          link(p.amount, {
            source: ({valueOf}) => valueOf(p.type),
            on: 'change',
            fieldState: 'reset',
            computation: () => null,
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      // Simulate dirty/touched field whose model `value()` is still `null`.
      f.amount().markAsTouched();
      f.amount().controlValue.set(123);
      expect(f.amount().value()).toBeNull();
      expect(f.amount().dirty()).toBeTrue();
      expect(f.amount().touched()).toBeTrue();

      // Source changes and derives `null` (equal to current `value()`): interaction state must still reset.
      f.type().value.set('text');
      TestBed.tick();
      expect(f.amount().value()).toBeNull();
      expect(f.amount().controlValue()).toBeNull();
      expect(f.amount().dirty()).toBeFalse();
      expect(f.amount().touched()).toBeFalse();
    });
  });

  describe('interaction with other rules & submission', () => {
    it('continues running when target field is readonly, disabled, or hidden', () => {
      const model = signal({
        qty: 2,
        total: 0,
        reason: 'other',
        otherReason: 'typing',
        lockedNote: 'old',
      });
      const f = form(
        model,
        (p) => {
          readonly(p.total);
          link(p.total, ({valueOf}) => valueOf(p.qty) * 10);

          hidden(p.otherReason, {when: ({valueOf}) => valueOf(p.reason) !== 'other'});
          link(p.otherReason, {
            source: () => '',
            computation: () => '',
            when: ({state}) => state.hidden(),
          });

          disabled(p.lockedNote);
          link(p.lockedNote, ({valueOf}) => `qty=${valueOf(p.qty)}`);
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.total().value()).toBe(20);
      expect(f.lockedNote().value()).toBe('qty=2');
      expect(f.otherReason().value()).toBe('typing');

      f.qty().value.set(4);
      f.reason().value.set('duplicate');
      TestBed.tick();
      expect(f.total().value()).toBe(40);
      expect(f.lockedNote().value()).toBe('qty=4');
      expect(f.otherReason().value()).toBe('');
    });

    it('works with debounced source fields and aborts stale target debounce syncs', async () => {
      let resolveSource!: () => void;
      let resolveTarget!: () => void;
      const model = signal({email: 'a@b.com', normalized: ''});
      const f = form(
        model,
        (p) => {
          debounce(p.email, () => new Promise<void>((r) => (resolveSource = r)));
          debounce(p.normalized, () => new Promise<void>((r) => (resolveTarget = r)));
          link(p.normalized, ({valueOf}) => valueOf(p.email).trim().toLowerCase());
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.normalized().value()).toBe('a@b.com');

      // Start a pending debounced edit on the target field.
      f.normalized().controlValue.set('stale-manual-edit');
      expect(f.normalized().value()).toBe('a@b.com');

      // Start a debounced edit on the source field -> should not link yet.
      f.email().controlValue.set('  NEW@EXAMPLE.COM  ');
      expect(f.normalized().value()).toBe('a@b.com');

      // Resolve source debounce -> flushes email and links normalized, aborting stale target sync.
      resolveSource();
      await Promise.resolve();
      await Promise.resolve();
      TestBed.tick();
      expect(f.normalized().value()).toBe('new@example.com');

      resolveTarget();
      await Promise.resolve();
      TestBed.tick();
      expect(f.normalized().value()).toBe('new@example.com');
    });

    it('flushes pending links synchronously in submit() before validating and running action', async () => {
      const model = signal({qty: 2, unitPrice: 10, total: 0});
      let submittedValue: {qty: number; unitPrice: number; total: number} | undefined;

      const f = form(
        model,
        (p) => {
          link(p.total, ({valueOf}) => valueOf(p.qty) * valueOf(p.unitPrice));
          max(p.total, 100);
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      // Update model in the same tick right before `submit()` (NO TestBed.tick()!).
      model.update((m) => ({...m, qty: 20}));
      const failed = await submit(f, async (submitted) => {
        submittedValue = submitted().value();
        return undefined;
      });
      // Linked total is flushed synchronously to 200 (> max 100), so submission is blocked.
      expect(failed).toBeFalse();
      expect(f.total().value()).toBe(200);
      expect(f.total().invalid()).toBeTrue();
      expect(submittedValue).toBeUndefined();

      // Update back to valid in the same tick right before `submit()`.
      model.update((m) => ({...m, qty: 5}));
      const succeeded = await submit(f, async (submitted) => {
        submittedValue = submitted().value();
        return undefined;
      });
      expect(succeeded).toBeTrue();
      expect(submittedValue).toEqual({qty: 5, unitPrice: 10, total: 50});
    });

    it('flushes debounced source AND dependent link synchronously inside submit()', async () => {
      const model = signal({qty: 2, unitPrice: 10, total: 0});
      let submittedValue: {qty: number; unitPrice: number; total: number} | undefined;

      const f = form(
        model,
        (p) => {
          debounce(p.qty, () => new Promise<void>(() => {}));
          link(p.total, ({valueOf}) => valueOf(p.qty) * valueOf(p.unitPrice));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();
      expect(f.total().value()).toBe(20);

      // Pending debounced edit on `qty` is flushed by `submit()` -> `total` must flush before action!
      f.qty().controlValue.set(6);
      const succeeded = await submit(f, async (submitted) => {
        submittedValue = submitted().value();
        return undefined;
      });
      expect(succeeded).toBeTrue();
      expect(submittedValue).toEqual({qty: 6, unitPrice: 10, total: 60});
    });

    it('validates against newly linked values', () => {
      const model = signal({country: 'US', state: 'CA'});
      const f = form(
        model,
        (p) => {
          required(p.state);
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f().valid()).toBeTrue();

      f.country().value.set('CA');
      TestBed.tick();
      expect(f.state().value()).toBe('');
      expect(f().valid()).toBeFalse();
    });
  });

  describe('chaining, pipelines & bidirectional links', () => {
    it('propagates diamond dependencies even when declared in reverse order', () => {
      const model = signal({qty: 1, price: 10, subtotal: 0, tax: 0, total: 0});
      const f = form(
        model,
        (p) => {
          // Deliberately reversed order relative to dependency direction:
          link(p.total, ({valueOf}) => valueOf(p.subtotal) + valueOf(p.tax));
          link(p.tax, ({valueOf}) => valueOf(p.subtotal) * 0.1);
          link(p.subtotal, ({valueOf}) => valueOf(p.qty) * valueOf(p.price));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f().value()).toEqual({qty: 1, price: 10, subtotal: 10, tax: 1, total: 11});

      f.qty().value.set(5);
      TestBed.tick();
      expect(f().value()).toEqual({qty: 5, price: 10, subtotal: 50, tax: 5, total: 55});
    });

    it('runs multiple rules on the same field in declaration order as a pipeline', () => {
      const model = signal({code: '  aBcDeF  '});
      const f = form(
        model,
        (p) => {
          link(p.code, ({value}) => value().trim());
          link(p.code, ({value}) => value().toLowerCase());
          link(p.code, ({value}) => value().slice(0, 3));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.code().value()).toBe('abc');

      f.code().value.set('  XYZ123  ');
      TestBed.tick();
      expect(f.code().value()).toBe('xyz');
    });

    it('supports multiple independent triggers driving the same field', () => {
      const model = signal({tier: 'free', promoCode: '', discount: 0});
      const f = form(
        model,
        (p) => {
          link(p.discount, {
            source: ({valueOf}) => valueOf(p.tier),
            on: 'change',
            computation: (tier) => (tier === 'enterprise' ? 20 : 0),
          });
          link(p.discount, {
            source: ({valueOf}) => valueOf(p.promoCode),
            when: ({valueOf}) => valueOf(p.promoCode) !== '',
            computation: (code) => (code === 'SUPER' ? 150 : 10),
          });
          // Clamp discount from either trigger.
          link(p.discount, ({value}) => Math.min(100, Math.max(0, value())));
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.tier().value.set('enterprise');
      TestBed.tick();
      expect(f.discount().value()).toBe(20);

      f.promoCode().value.set('SUPER');
      TestBed.tick();
      expect(f.discount().value()).toBe(100);

      f.tier().value.set('free');
      TestBed.tick();
      expect(f.discount().value()).toBe(0);
    });

    it('lets the last unconditional rule win when multiple eager rules target the same field', () => {
      const model = signal({x: 0});
      const f = form(
        model,
        (p) => {
          link(p.x, () => 1);
          link(p.x, () => 2);
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.x().value()).toBe(2);
    });

    it('stabilizes bidirectional conversions cleanly', () => {
      const model = signal({celsius: 0, fahrenheit: 32});
      const f = form(
        model,
        (p) => {
          link(p.fahrenheit, {
            source: ({valueOf}) => valueOf(p.celsius),
            on: 'change',
            computation: (c) => (c * 9) / 5 + 32,
          });
          link(p.celsius, {
            source: ({valueOf}) => valueOf(p.fahrenheit),
            on: 'change',
            computation: (far) => ((far - 32) * 5) / 9,
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.fahrenheit().value.set(68);
      TestBed.tick();
      expect(f.fahrenheit().value()).toBe(68);
      expect(f.celsius().value()).toBe(20);

      f.celsius().value.set(100);
      TestBed.tick();
      expect(f.celsius().value()).toBe(100);
      expect(f.fahrenheit().value()).toBe(212);

      model.update((m) => ({...m, fahrenheit: 32}));
      TestBed.tick();
      expect(f.fahrenheit().value()).toBe(32);
      expect(f.celsius().value()).toBe(0);
    });

    it('preserves manual sibling edits made after a linked update flushes', () => {
      const model = signal({country: 'US', state: 'CA'});
      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.country().value.set('CA');
      TestBed.tick();
      expect(f.state().value()).toBe('');

      f.state().value.set('ON');
      TestBed.tick();
      expect(f().value()).toEqual({country: 'CA', state: 'ON'});
    });

    it('supports 3-way invoice calculation when the third field is pristine (issue #65467)', () => {
      const model = signal({net: 0, vat: 0, total: 0});
      const f = form(
        model,
        (p) => {
          link(p.total, {
            source: ({valueOf}) => valueOf(p.net) + valueOf(p.vat),
            computation: (total) => total,
            when: ({state}) => !state.dirty(),
          });
          link(p.vat, {
            source: ({valueOf}) => valueOf(p.total) - valueOf(p.net),
            computation: (vat) => vat,
            when: ({state, stateOf}) => !state.dirty() && stateOf(p.total).dirty(),
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.net().controlValue.set(100);
      f.vat().controlValue.set(20);
      TestBed.tick();
      expect(f.total().value()).toBe(120);

      // Reset vat + total; edit net and total -> vat auto-calculates!
      f().reset({net: 0, vat: 0, total: 0});
      f.net().controlValue.set(100);
      f.total().controlValue.set(119);
      TestBed.tick();
      expect(f.vat().value()).toBe(19);
    });
  });

  describe('composition: schema, apply, applyWhen, applyEach, recursive', () => {
    it('composes in a reusable schema() applied to multiple branches', () => {
      interface Line {
        qty: number;
        price: number;
        total: number;
      }
      const lineSchema = schema<Line>((p) => {
        link(p.total, ({valueOf}) => valueOf(p.qty) * valueOf(p.price));
      });

      const model = signal({
        primary: {qty: 2, price: 5, total: 0},
        secondary: {qty: 3, price: 7, total: 0},
      });

      const f = form(
        model,
        (p) => {
          apply(p.primary, lineSchema);
          apply(p.secondary, lineSchema);
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.primary.total().value()).toBe(10);
      expect(f.secondary.total().value()).toBe(21);

      f.primary.qty().value.set(4);
      TestBed.tick();
      expect(f.primary.total().value()).toBe(20);
      expect(f.secondary.total().value()).toBe(21);
    });

    it('gates link rules with applyWhen and applyWhenValue', () => {
      type Vehicle =
        {kind: 'car'; wheels: number; label: string} | {kind: 'boat'; hull: string; label: string};

      let carSourceCalls = 0;
      let carComputeCalls = 0;
      const model = signal<Vehicle>({kind: 'boat', hull: 'wood', label: 'initial'});
      const f = form(
        model,
        (p) => {
          applyWhenValue(
            p,
            (v): v is Extract<Vehicle, {kind: 'car'}> => v.kind === 'car',
            (car) => {
              link(car.label, {
                source: ({valueOf}) => {
                  carSourceCalls++;
                  return valueOf(car.wheels);
                },
                computation: (wheels) => {
                  carComputeCalls++;
                  return `car-${wheels}`;
                },
              });
            },
          );
          applyWhen(
            p,
            ({value}) => value().kind === 'boat',
            (boat) => {
              link(boat.label, () => 'boat');
            },
          );
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      // Narrowed-off car rule never reads `car.wheels`.
      expect(carSourceCalls).toBe(0);
      expect(f.label().value()).toBe('boat');

      f().value.set({kind: 'car', wheels: 4, label: 'ignored'});
      TestBed.tick();
      expect(carComputeCalls).toBe(1);
      expect(f.label().value()).toBe('car-4');
    });

    it('works inside applyEach arrays with dynamic additions, removals, and parent aggregation', () => {
      const model = signal({
        items: [
          {qty: 2, price: 10, lineTotal: 0, order: 0},
          {qty: 3, price: 5, lineTotal: 0, order: 0},
        ],
        grandTotal: 0,
      });

      const f = form(
        model,
        (p) => {
          applyEach(p.items, (item) => {
            link(item.lineTotal, ({valueOf}) => valueOf(item.qty) * valueOf(item.price));
            link(item.order, ({stateOf}) => Number(stateOf(item).keyInParent()) + 1);
          });
          link(p.grandTotal, ({valueOf}) =>
            valueOf(p.items).reduce((sum, i) => sum + i.lineTotal, 0),
          );
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.items[0].lineTotal().value()).toBe(20);
      expect(f.items[0].order().value()).toBe(1);
      expect(f.items[1].lineTotal().value()).toBe(15);
      expect(f.items[1].order().value()).toBe(2);
      expect(f.grandTotal().value()).toBe(35);

      // Update an item quantity.
      f.items[0].qty().value.set(5);
      TestBed.tick();
      expect(f.items[0].lineTotal().value()).toBe(50);
      expect(f.grandTotal().value()).toBe(65);

      // Append a new item via form write.
      f.items().value.update((items) => [...items, {qty: 4, price: 2, lineTotal: 0, order: 0}]);
      TestBed.tick();
      expect(f.items[2].lineTotal().value()).toBe(8);
      expect(f.items[2].order().value()).toBe(3);
      expect(f.grandTotal().value()).toBe(73);

      // Remove the first item -> remaining items re-index automatically.
      f.items().value.update((items) => items.slice(1));
      TestBed.tick();
      expect(f.items[0].order().value()).toBe(1);
      expect(f.items[1].order().value()).toBe(2);
      expect(f.grandTotal().value()).toBe(23);
    });

    it('links new items pushed directly to an initially empty applyEach array', () => {
      const model = signal<{items: Array<{qty: number; price: number; lineTotal: number}>}>({
        items: [],
      });

      const f = form(
        model,
        (p) => {
          applyEach(p.items, (item) => {
            link(item.lineTotal, ({valueOf}) => valueOf(item.qty) * valueOf(item.price));
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      model.set({items: [{qty: 3, price: 4, lineTotal: 0}]});
      TestBed.tick();
      expect(f.items[0].lineTotal().value()).toBe(12);
      expect(model().items[0].lineTotal).toBe(12);
    });

    it('preserves array item FieldNode identity when linking an entire item object', () => {
      const model = signal({
        multiplier: 2,
        items: [{base: 5, scaled: 0}],
      });

      const f = form(
        model,
        (p) => {
          applyEach(p.items, (item) => {
            link(item, {
              source: ({valueOf}) => valueOf(p.multiplier),
              computation: (mult, {value}) => ({...value(), scaled: value().base * mult}),
            });
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      const originalItemRef = f.items[0];
      f.items[0].base().markAsDirty();
      TestBed.tick();
      expect(f.items[0].scaled().value()).toBe(10);

      f.multiplier().value.set(3);
      TestBed.tick();
      expect(f.items[0]).toBe(originalItemRef);
      expect(f.items[0].scaled().value()).toBe(15);
      expect(f.items[0].base().dirty()).toBeTrue();
    });

    it('supports recursive schemas', () => {
      interface Node {
        value: number;
        doubled: number;
        next?: Node;
      }

      const nodeSchema: Schema<Node> = schema((p) => {
        link(p.doubled, ({valueOf}) => valueOf(p.value) * 2);
        apply(p.next!, nodeSchema);
      });

      const model = signal<Node>({
        value: 3,
        doubled: 0,
        next: {value: 7, doubled: 0},
      });

      const f = form(model, nodeSchema, {injector: TestBed.inject(Injector)});
      TestBed.tick();
      expect(f.doubled().value()).toBe(6);
      expect(f.next!.doubled().value()).toBe(14);

      f.next!.value().value.set(10);
      TestBed.tick();
      expect(f.next!.doubled().value()).toBe(20);
      expect(f.doubled().value()).toBe(6);
    });
  });

  describe('reset() integration', () => {
    it('re-baselines `on: "change"` rules on root reset(value) while resyncing `on: "always"` rules', () => {
      const model = signal({country: 'US', state: 'CA', qty: 2, total: 0});
      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: () => '',
          });
          link(p.total, ({valueOf}) => valueOf(p.qty) * 10);
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.total().value()).toBe(20);

      // Resetting the whole form to a loaded snapshot keeps `'ON'` instead of wiping it to `''`.
      f().reset({country: 'CA', state: 'ON', qty: 4, total: 0});
      TestBed.tick();
      expect(f.country().value()).toBe('CA');
      expect(f.state().value()).toBe('ON');
      expect(f.total().value()).toBe(40);

      // Subsequent user change to `country` resets `state` as expected.
      f.country().value.set('FR');
      TestBed.tick();
      expect(f.state().value()).toBe('');
    });

    it('re-baselines `on: "change"` rules when model.set(snapshot) is followed by f().reset()', () => {
      const model = signal({country: 'US', state: 'CA'});
      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      model.set({country: 'CA', state: 'ON'});
      f().reset();
      TestBed.tick();
      expect(f.country().value()).toBe('CA');
      expect(f.state().value()).toBe('ON');

      f.country().value.set('FR');
      TestBed.tick();
      expect(f.state().value()).toBe('');
    });

    it('still triggers sibling `on: "change"` rules when only the source child is reset(value)', () => {
      const model = signal({country: 'US', state: 'CA'});
      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.country().reset('DE');
      TestBed.tick();
      expect(f.country().value()).toBe('DE');
      expect(f.state().value()).toBe('');
    });
  });

  describe('lazy materialization & coordinator scaling', () => {
    it('keeps unrelated sibling subtrees unmaterialized', () => {
      const model = signal({
        linked: {a: 2, b: 0},
        unrelated: {nested: 'value'},
      });

      const f = form(
        model,
        (p) => {
          link(p.linked.b, ({valueOf}) => valueOf(p.linked.a) * 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      // Before effects flush, accessing unrelated does not materialize its children.
      expect((f.unrelated() as any).structure._areChildrenMaterialized()).toBeFalse();

      TestBed.tick();
      expect(model().linked.b).toBe(20);
    });

    it('does not allocate per-field DestroyableInjectors for linked fields', () => {
      const model = signal({
        items: [
          {qty: 1, price: 10, total: 0},
          {qty: 2, price: 20, total: 0},
        ],
      });

      const f = form(
        model,
        (p) => {
          applyEach(p.items, (item) => {
            link(item.total, ({valueOf}) => valueOf(item.qty) * valueOf(item.price));
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect((f.items[0].total() as any).structure._injector).toBeUndefined();
      expect((f.items[1].total() as any).structure._injector).toBeUndefined();
    });

    it('re-evaluates only the affected item computation in applyEach arrays (O(1) isolation)', () => {
      const callsByIndex = [0, 0, 0];
      const model = signal({
        items: [
          {id: 0, qty: 1, price: 10, total: 0},
          {id: 1, qty: 2, price: 20, total: 0},
          {id: 2, qty: 3, price: 30, total: 0},
        ],
      });

      const f = form(
        model,
        (p) => {
          applyEach(p.items, (item) => {
            link(item.total, ({valueOf}) => {
              callsByIndex[valueOf(item.id)]++;
              return valueOf(item.qty) * valueOf(item.price);
            });
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();
      expect(callsByIndex).toEqual([1, 1, 1]);

      // Updating item 0 must not re-evaluate item 1 or item 2.
      f.items[0].qty().value.set(5);
      TestBed.tick();
      expect(f.items[0].total().value()).toBe(50);
      expect(callsByIndex).toEqual([2, 1, 1]);
    });

    it('works with component input.required() without throwing NG0950 during construction', () => {
      @Component({
        template: '',
      })
      class OrderComponent {
        readonly unitPrice = input.required<number>();
        readonly model = signal({qty: 3, total: 0});
        readonly f = form(this.model, (p) => {
          link(p.total, ({valueOf}) => valueOf(p.qty) * this.unitPrice());
        });
      }

      const fixture = TestBed.createComponent(OrderComponent);
      fixture.componentRef.setInput('unitPrice', 15);
      fixture.detectChanges();

      expect(fixture.componentInstance.f.total().value()).toBe(45);

      fixture.componentRef.setInput('unitPrice', 20);
      fixture.detectChanges();
      expect(fixture.componentInstance.f.total().value()).toBe(60);
    });

    it('re-baselines `on: "change"` when `when` re-activates after source drifted while inactive', () => {
      const model = signal({enabled: true, country: 'US', state: 'CA'});
      const f = form(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            when: ({valueOf}) => valueOf(p.enabled),
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      // Disable rule, change country + state while inactive, then re-enable.
      f.enabled().value.set(false);
      TestBed.tick();
      f.country().value.set('DE');
      f.state().value.set('BY');
      TestBed.tick();

      f.enabled().value.set(true);
      TestBed.tick();
      expect(f.state().value()).toBe('BY');

      // Subsequent change while active triggers normally.
      f.country().value.set('FR');
      TestBed.tick();
      expect(f.state().value()).toBe('');
    });

    it('composes parent and child link() rules safely when parent replaces an object', () => {
      const model = signal<{useAddress: boolean; address: {city: string; label: string} | null}>({
        useAddress: true,
        address: {city: 'Paris', label: ''},
      });
      const f = form(
        model,
        (p) => {
          link(p.address, {
            source: ({valueOf}) => valueOf(p.useAddress),
            on: 'change',
            computation: (use) => (use ? {city: 'Lyon', label: ''} : null),
          });
          applyWhenValue(
            p.address,
            (addr): addr is {city: string; label: string} => addr !== null,
            (addr) => {
              link(addr.label, ({valueOf}) => `City: ${valueOf(addr.city)}`);
            },
          );
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();
      expect(f.address()?.value()).toEqual({city: 'Paris', label: 'City: Paris'});

      f.useAddress().value.set(false);
      TestBed.tick();
      expect(f.address().value()).toBeNull();

      f.useAddress().value.set(true);
      TestBed.tick();
      expect(f.address().value()).toEqual({city: 'Lyon', label: 'City: Lyon'});
    });
  });

  describe('error handling & cycle detection', () => {
    it('throws on non-converging self-link (on: "always")', () => {
      const model = signal({count: 0});
      form(
        model,
        (p) => {
          link(p.count, ({value}) => value() + 1);
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(() => TestBed.tick()).toThrowError(/NG01922/);
    });

    it('throws on non-converging self-link (on: "change")', () => {
      const model = signal({count: 0});
      const f = form(
        model,
        (p) => {
          link(p.count, {source: ({value}) => value(), computation: (v) => v + 1, on: 'change'});
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.count().value.set(1);
      expect(() => TestBed.tick()).toThrowError(/NG01922/);
    });

    it('throws on non-converging mutual cycle', () => {
      const model = signal({a: 0, b: 0});
      form(
        model,
        (p) => {
          link(p.a, ({valueOf}) => valueOf(p.b) + 1);
          link(p.b, ({valueOf}) => valueOf(p.a) + 1);
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(() => TestBed.tick()).toThrowError(/NG01922/);
    });

    it('does not false-positive on >100 synchronous sequential updates across ticks', () => {
      const model = signal({input: 0, doubled: 0});
      const f = form(
        model,
        (p) => {
          link(p.doubled, ({valueOf}) => valueOf(p.input) * 2);
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      for (let i = 1; i <= 150; i++) {
        f.input().value.set(i);
        TestBed.tick();
      }
      expect(f.doubled().value()).toBe(300);
    });

    it('recovers if a computation function throws', () => {
      let shouldThrow = true;
      const model = signal({input: 1, output: 0});
      const f = form(
        model,
        (p) => {
          link(p.output, {
            source: ({valueOf}) => valueOf(p.input),
            on: 'change',
            computation: (v) => {
              if (shouldThrow) {
                throw new Error('boom');
              }
              return v * 10;
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      f.input().value.set(2);
      expect(() => TestBed.tick()).toThrowError('boom');

      shouldThrow = false;
      f.input().value.set(3);
      TestBed.tick();
      expect(f.output().value()).toBe(30);
    });

    it('throws when using a SchemaPath outside its owning schema', () => {
      let captured: any;
      form(
        signal({a: 1}),
        (p) => {
          captured = p.a;
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(() => link(captured, () => 2)).toThrowError(/NG01908/);
    });
  });

  describe('compatForm interop', () => {
    it('links a signal field from a legacy FormControl', () => {
      const legacy = new FormControl('US', {nonNullable: true});
      const model = signal({country: legacy, state: 'CA'});

      const f = compatForm(
        model,
        (p) => {
          link(p.state, {
            source: ({valueOf}) => valueOf(p.country),
            on: 'change',
            computation: () => '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      TestBed.tick();

      expect(f.state().value()).toBe('CA');

      legacy.setValue('DE');
      TestBed.tick();
      expect(f.state().value()).toBe('');
    });
  });
});
