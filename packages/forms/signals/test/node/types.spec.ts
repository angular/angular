/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {
  applyEach,
  FieldTree,
  form,
  provideSignalFormsConfig,
  ReadonlyFieldState,
  ReadonlyFieldTree,
  required,
  schema,
  SchemaFn,
  SchemaPathTree,
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

    it('should allow numeric index on SchemaPathTree of mutable array', () => {
      schema<{items: string[]}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          // numeric index before fieldTreeOf must resolve to ReadonlyFieldTree<string>
          const field: ReadonlyFieldTree<string> = fieldTreeOf(p.items[0]);
          field().value();
          return null;
        });
      });
    });

    it('should allow numeric index on SchemaPathTree of readonly array', () => {
      schema<{items: readonly string[]}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          const field: ReadonlyFieldTree<string> = fieldTreeOf(p.items[0]);
          field().value();
          return null;
        });
      });
    });

    it('should allow rules to be applied directly to an element path of a mutable array', () => {
      schema<{items: string[]}>((p) => {
        // required() expects SchemaPath<string, Supported, Child> — must compile
        required(p.items[0]);
      });
    });

    it('should allow rules to be applied directly to an element path of a readonly array', () => {
      schema<{items: readonly string[]}>((p) => {
        required(p.items[0]);
      });
    });

    it('should allow numeric index before and after fieldTreeOf to be equivalent', () => {
      schema<{items: string[]}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          // Both orderings must produce ReadonlyFieldTree<string>
          const a: ReadonlyFieldTree<string> = fieldTreeOf(p.items[0]);
          const b: ReadonlyFieldTree<string> = fieldTreeOf(p.items)[0];
          a().value();
          b().value();
          return null;
        });
      });
    });

    it('should allow numeric index on nested arrays', () => {
      schema<{matrix: string[][]}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          // path.matrix[0] → SchemaPathTree<string[]>, path.matrix[0][0] → SchemaPathTree<string>
          const row: ReadonlyFieldTree<string[]> = fieldTreeOf(p.matrix[0]);
          const cell: ReadonlyFieldTree<string> = fieldTreeOf(p.matrix[0][0]);
          row().value();
          cell().value();
          return null;
        });
      });
    });

    it('should not allow numeric index on SchemaPathTree of a plain object', () => {
      schema<{obj: {x: number}}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          // @ts-expect-error — plain objects have no numeric index
          fieldTreeOf(p.obj[0]);
          return null;
        });
      });
    });

    it('should not allow numeric index on SchemaPathTree of a primitive', () => {
      schema<{name: string}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          // @ts-expect-error — primitives have no numeric index
          fieldTreeOf(p.name[0]);
          return null;
        });
      });
    });

    it('should preserve string key access on Record after the array fix', () => {
      schema<{lookup: Record<string, string>}>((p) => {
        validate(p, ({fieldTreeOf}) => {
          // Records must continue to work — no regression
          const field: ReadonlyFieldTree<string> = fieldTreeOf(p.lookup['key']);
          field().value();
          return null;
        });
      });
    });

    it('should allow SchemaPathTree of array to be passed to applyEach', () => {
      // applyEach takes SchemaPath<TValue>; SchemaPathTree<string[]> must remain assignable
      schema<{items: string[]}>((p) => {
        applyEach(p.items, (item: SchemaPathTree<string>) => {
          required(item);
        });
      });
    });
  });
}
