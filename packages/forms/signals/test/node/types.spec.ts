/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal, Signal} from '@angular/core';
import {
  FieldTree,
  form,
  required,
  schema,
  SchemaFn,
  FieldStateSnapshot,
  FormFieldSnapshot,
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

    describe('FieldStateSnapshot', () => {
      it('should not expose mutation methods', () => {
        const state: FieldStateSnapshot<string> = null!;
        // @ts-expect-error
        state.markAsDirty;
        // @ts-expect-error
        state.markAsTouched;
        // @ts-expect-error
        state.reset;
        // @ts-expect-error
        state.metadata;
        // @ts-expect-error
        state.focusBoundControl;
        // @ts-expect-error
        state.formFieldBindings;
        // @ts-expect-error
        state.value;
        // @ts-expect-error
        state.controlValue;
      });

      it('should expose read-only signal properties', () => {
        const state: FieldStateSnapshot<string> = null!;
        state.dirty;
        state.touched;
        state.valid;
        state.invalid;
        state.pending;
        state.disabled;
        state.errors;
        state.errorSummary;
        state.hidden;
        state.readonly;
        state.required;
        state.name;
        state.pattern;
        state.disabledReasons;
        state.submitting;
        state.keyInParent;
        state.max;
        state.min;
        state.maxLength;
        state.minLength;
      });
    });

    describe('FormFieldSnapshot', () => {
      it('should not expose mutation methods', () => {
        const snapshot: FormFieldSnapshot = null!;
        // @ts-expect-error
        snapshot.focus;
        // @ts-expect-error
        snapshot.registerAsBinding;
        // @ts-expect-error
        snapshot.fieldTree;
        // @ts-expect-error
        snapshot.state.markAsDirty;
        // @ts-expect-error
        snapshot.state.markAsTouched;
        // @ts-expect-error
        snapshot.state.reset;
        // @ts-expect-error
        snapshot.state.value;
        // @ts-expect-error
        snapshot.state.controlValue;
      });

      it('should expose read-only properties', () => {
        const snapshot: FormFieldSnapshot = null!;
        snapshot.element;
        snapshot.errors;
        snapshot.parseErrors;
        snapshot.state;
        snapshot.state.dirty;
        snapshot.state.touched;
        snapshot.state.valid;
        snapshot.state.invalid;
        snapshot.state.disabled;
        snapshot.state.errors;
        snapshot.state.hidden;
      });
    });

    describe('SignalFormsConfig', () => {
      it('should accept FormFieldSnapshot in classes predicate', () => {
        const config: SignalFormsConfig = {
          classes: {
            'my-class': (state: FormFieldSnapshot) => {
              // Can access readonly properties
              state.element;
              state.errors;
              state.parseErrors;
              state.state.valid;
              state.state.invalid;
              state.state.dirty;
              state.state.touched;
              state.state.disabled;
              return state.state.valid();
            },
          },
        };
      });

      it('should not allow mutation methods in classes predicate', () => {
        const config: SignalFormsConfig = {
          classes: {
            'invalid-class': (state: FormFieldSnapshot) => {
              // @ts-expect-error
              state.focus;
              // @ts-expect-error
              state.registerAsBinding;
              // @ts-expect-error
              state.fieldTree;
              // @ts-expect-error
              state.state.markAsDirty;
              // @ts-expect-error
              state.state.markAsTouched;
              // @ts-expect-error
              state.state.reset;
              // @ts-expect-error
              state.state.value;
              // @ts-expect-error
              state.state.controlValue;
              return false;
            },
          },
        };
      });
    });
  });
}
