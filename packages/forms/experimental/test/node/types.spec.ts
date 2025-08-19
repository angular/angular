/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';
import {form, required, schema, SchemaFn} from '../../public_api';

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
  });
}
