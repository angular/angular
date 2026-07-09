/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {
  createMetadataKey,
  FieldTree,
  form,
  LimitKey,
  MIN,
  MIN_DATE,
  MIN_NUMBER,
  MAX,
  MAX_DATE,
  MAX_NUMBER,
  metadata,
  provideSignalFormsConfig,
  ReadonlyFieldState,
  required,
  schema,
  SchemaFn,
  validate,
} from '../../public_api';

interface Order {
  id: string;
  details: {
    total: number;
  };
}

interface PhoneOrder {
  id: string;
  details: {
    total: number;
    model: string;
    color: string;
  };
}

interface PizzaOrder {
  id: string;
  details: {
    total: number;
    toppings: string;
  };
}

function typeVerificationOnlyDoNotRunMe() {
  describe('types', () => {
    it('should apply schema function of exact type', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const pizzaOrderSchema: SchemaFn<PizzaOrder> = null!;
      form(pizzaOrder, pizzaOrderSchema);
    });

    it('should apply schema function of partial type', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const orderSchema: SchemaFn<Order> = null!;
      form(pizzaOrder, orderSchema);
    });

    it('should not apply schema function of different type', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const phoneOrderSchema: SchemaFn<PhoneOrder> = null!;
      // @ts-expect-error
      form(pizzaOrder, phoneOrderSchema);
    });

    it('should apply schema of exact type', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const pizzaOrderSchema = schema<PizzaOrder>(null!);
      form(pizzaOrder, pizzaOrderSchema);
    });

    it('should apply schema of partial type', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const orderSchema = schema<Order>(null!);
      form(pizzaOrder, orderSchema);
    });

    it('should not apply schema of different type', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const phoneOrderSchema = schema<PhoneOrder>(null!);
      // @ts-expect-error
      form(pizzaOrder, phoneOrderSchema);
    });

    it('should not allow binding logic to a potentially undefined field', () => {
      schema<{a: number; b: number | undefined; c?: number}>((p) => {
        required(p.a);
        // @ts-expect-error
        required(p.b);
        // @ts-expect-error
        required(p.c);
      });
    });

    it('should allow FieldTree of recursive type', () => {
      type RecursiveType = (number | RecursiveType)[];
      form(signal<RecursiveType>([5]));
    });

    it('should allow property access on generic type unions', () => {
      // Validates that uninstantiated generic unions can still access shared
      // fields via naked conditional distribution in FieldTree
      function testGeneric<T extends {a: 1} | {a: 1; b: 2}>(f: FieldTree<T>) {
        const x: FieldTree<1> = f.a;
        return x;
      }
    });

    it('should allow ReadonlyArray in model and be iterable', () => {
      interface Order {
        readonly products: readonly string[];
      }
      const order: WritableSignal<Order> = null!;
      const f = form(order);
      // Iterating over products should yield FieldTree<string> items, not [string, FieldTree] entries
      for (const product of f.products) {
        const p: FieldTree<string> = product;
        p().value();
      }
    });

    it('should allow Array in model and be iterable', () => {
      interface Order {
        products: string[];
      }
      const order: WritableSignal<Order> = null!;
      const f = form(order);
      for (const product of f.products) {
        const p: FieldTree<string> = product;
        p().value();
      }
    });

    it('should allow assigning FieldState to ReadonlyFieldState', () => {
      const pizzaOrder: WritableSignal<PizzaOrder> = null!;
      const f = form(pizzaOrder);
      const readonlyState: ReadonlyFieldState<PizzaOrder> = f();
      readonlyState.value();
    });

    it('should prevent writing to field value through context in a validation rule', () => {
      schema<PizzaOrder>((p) => {
        validate(p.id, (ctx) => {
          // @ts-expect-error
          ctx.value.set('new value');
          // @ts-expect-error
          ctx.state.value.set('new value');
          // @ts-expect-error
          ctx.stateOf(p.details).value.set({total: 0});
          return null;
        });
      });
    });

    it('should prevent writing to field value through context in a signal provider', () => {
      provideSignalFormsConfig({
        classes: {
          'my-class': (binding) => {
            // @ts-expect-error
            binding.state().value.set('new value');
            return true;
          },
        },
      });
    });

    describe('metadata', () => {
      it('should prevent assigning a number limit to a Date field', () => {
        interface EventBooking {
          date: Date;
        }

        schema<EventBooking>((p) => {
          metadata(p.date, MIN, () => MIN_DATE);
          metadata(
            p.date,
            MIN,
            // @ts-expect-error
            () => MIN_NUMBER,
          );
        });
      });

      it('should prevent assigning a Date limit to a number field', () => {
        interface PriceConstraint {
          amount: number;
        }

        schema<PriceConstraint>((p) => {
          metadata(p.amount, MAX, () => MAX_NUMBER);
          metadata(
            p.amount,
            MAX,
            // @ts-expect-error
            () => MAX_DATE,
          );
        });
      });

      it('should not interpret a MetadataKey as a LimitSelectionKey', () => {
        interface EventBooking {
          date: Date;
        }

        // Structurally this key *looks* like a `LimitSelectionKey`, but it's not created by
        // `createLimitSelectionKey()`, so it doesn't satisfy the `LimitSelectionKey` constraint in
        // `metadata()`. Therefore, type checking enforces that assignments are based on the key
        // type, rather than the field value type.
        const key = createMetadataKey<LimitKey<number>>();
        schema<EventBooking>((p) => {
          metadata(p.date, key, () => MIN_NUMBER);
          metadata(
            p.date,
            key,
            // @ts-expect-error
            () => MAX_DATE,
          );
        });
      });
    });
  });
}
