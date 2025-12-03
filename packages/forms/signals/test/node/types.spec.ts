/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {
  form,
  ReadonlyFieldState,
  required,
  schema,
  SchemaFn,
  SignalFormsConfig,
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
  });

  describe('ReadonlyFieldState', () => {
    it('should not expose mutation methods', () => {
      const state: ReadonlyFieldState<string> = null!;
      // @ts-expect-error
      state.markAsDirty;
      // @ts-expect-error
      state.markAsTouched;
      // @ts-expect-error
      state.setControlValue;
      // @ts-expect-error
      state.reset;
      // @ts-expect-error
      state.fieldBindings;
      // @ts-expect-error
      state.value;
    });

    it('should expose read-only properties', () => {
      const state: ReadonlyFieldState<string> = null!;
      state.dirty;
      state.touched;
      state.valid;
      state.invalid;
      state.pending;
      state.disabled;
      state.errors;
      state.hidden;
    });
  });

  describe('SignalFormsConfig', () => {
    it('should not allow mutation methods in classes predicate', () => {
      const config: SignalFormsConfig = {
        classes: {
          'my-class': (state) => {
            // @ts-expect-error
            state.markAsDirty;
            // @ts-expect-error
            state.markAsTouched;
            // @ts-expect-error
            state.setControlValue;
            // @ts-expect-error
            state.reset;
            // @ts-expect-error
            state.fieldBindings;
            // @ts-expect-error
            state.value;
            return state.valid();
          },
        },
      };
    });
  });
}
