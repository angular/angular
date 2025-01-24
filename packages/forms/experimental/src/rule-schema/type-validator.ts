import { computed, Signal } from '@angular/core';

// Aligns with `ZodType<T>`
export interface TypeValidator<T> {
  safeParse: (value: unknown) => { data?: T; error?: TypeValidationRootError };
}

// Aligns with `ZodError`
export interface TypeValidationRootError {
  errors: TypeValidationIssue[];
}

// Aligns with `ZodIssue`
export interface TypeValidationIssue {
  message: string;
  path: (string | number)[];
}

export type TypeValidationError<I extends TypeValidationIssue = TypeValidationIssue> = {
  type: 'type-error';
  message: string;
  issue: I;
};

export interface TypeValidationErrorTree {
  all: Signal<TypeValidationError[]>;
  own: Signal<TypeValidationError[]>;
  property: (key: PropertyKey) => TypeValidationErrorTree;
}

export function getTypeErrorTree<T>(
  validator: TypeValidator<T> | undefined,
  value: Signal<unknown>,
) {
  if (!validator) {
    return undefined;
  }
  return getTypeErrorTreeForPath(
    computed(() => runValidator(validator, value())),
    [],
  );
}

export function mergeTypeErrorTree(
  tree1?: TypeValidationErrorTree,
  tree2?: TypeValidationErrorTree,
): TypeValidationErrorTree | undefined {
  if (tree1 === undefined || tree2 === undefined) {
    return tree1 ?? tree2;
  }
  return getTypeErrorTreeForPath(
    computed(() => [...tree1.all(), ...tree2.all()]),
    [],
  );
}

function runValidator<T>(validator: TypeValidator<T>, value: T): TypeValidationError[] {
  return (validator.safeParse(value).error?.errors ?? []).map((e) => ({
    type: 'type-error',
    message: e.message,
    issue: e,
  }));
}

function getTypeErrorTreeForPath(
  all: Signal<TypeValidationError[]>,
  path: string[],
): TypeValidationErrorTree {
  const newAll = computed(() =>
    all().filter((e) => pathEquals(e.issue.path.slice(0, path.length), path)),
  );
  return {
    all: newAll,
    own: computed(() => newAll().filter((e) => e.issue.path.length === path.length)),
    property: (key: PropertyKey) => getTypeErrorTreeForPath(all, [...path, String(key)]),
  };
}

function pathEquals(p1: (string | number)[], p2: (string | number)[]) {
  return p1.every((v, i) => v === p2[i]);
}
