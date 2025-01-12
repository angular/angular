// Type definitions only for how dynamic arrays & objects could work:

const LOGIC = Symbol('LOGIC');

const BRAND = Symbol('BRAND');

export const $idx = Symbol('$idx');

export const $prop = Symbol('$prop');

export type FormField<T> = (() => T) & {
  readonly valid: boolean;
  readonly disabled: boolean | {reason: string};
  readonly errors: readonly string[];
};

export type FormLogic<T> = {};

export type Form<T, D extends PropertyKey[] = []> = {
  [LOGIC]: FormLogic<T>;
  [BRAND]: [T, D];
} & (D extends [] ? {$: FormField<T>} : {}) &
  (T extends Record<PropertyKey, unknown>
    ? {[K in keyof T]: Form<T[K], D>} & {[$prop]: Form<T[PropertyKey], [...D, keyof T]>}
    : T extends ReadonlyArray<unknown>
      ? Form<T[number], D>[] & {[$idx]: Form<T[number], [...D, number]>}
      : {});

export function logic<T>(form: Form<T, []>, schema: {disabled: boolean}): void;
export function logic<T, D extends PropertyKey[]>(
  form: Form<T, D>,
  schema: (dynamic: D) => {disabled: boolean},
): void;
export function logic(...args: any[]): any {}

// Demo:

const f: Form<Record<string, {x: number}>[]> = undefined!;

f[0]['p'].x.$;
f[$idx][$prop].x; // $ not available on dynamic path

logic(f[0]['p'].x, {disabled: true});
logic(f[$idx][$prop].x, ([idx, prop]) => ({disabled: idx % 2 === 0 && prop[0] === 'p'}));
