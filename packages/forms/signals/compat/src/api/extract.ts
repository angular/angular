/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {FieldState, FieldTree} from '../../../src/api/types';
import {isArray, isObject} from '../../../src/util/type_guards';

/**
 * Type utility that recursively unwraps the value type of a `FieldTree`.
 *
 * If the value type contains `AbstractControl` instances (common in compat mode),
 * they are replaced with their underlying value types.
 */
export type RawValue<T> =
  T extends AbstractControl<infer TValue, any>
    ? TValue
    : T extends (infer U)[]
      ? RawValue<U>[]
      : T extends object
        ? {[K in keyof T]: RawValue<T[K]>}
        : T;

/**
 * A type that recursively makes all properties of T optional.
 * Used for the result of `extractValue` when filtering is applied.
 * @experimental 21.2.0
 */
export type DeepPartial<T> =
  | (T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends object
        ? {[K in keyof T]?: DeepPartial<T[K]>}
        : T)
  | undefined;

/**
 * Criteria that determine whether a field should be included in the extraction.
 *
 * Each property is optional; when provided, the field must match the specified state.
 *
 * @category interop
 * @experimental 21.2.0
 */
export interface ExtractFilter {
  readonly dirty?: boolean;
  readonly touched?: boolean;
  readonly enabled?: boolean;
}

/**
 * Utility to unwrap a {@link FieldTree} into its underlying raw value.
 *
 * This function is recursive, so if the field tree represents an object or an array,
 * the result will be an object or an array of the raw values of its children.
 *
 * @param field The field tree to extract the value from.
 * @returns The raw value of the field tree.
 *
 * @category interop
 * @experimental 21.2.0
 */
export function extractValue<T>(field: FieldTree<T>): RawValue<T>;
/**
 * Utility to unwrap a {@link FieldTree} into its underlying raw value.
 *
 * This function is recursive, so if the field tree represents an object or an array,
 * the result will be an object or an array of the raw values of its children.
 *
 * @param field The field tree to extract the value from.
 * @param filter Criteria to include only fields matching certain state (dirty, touched, enabled).
 * @returns A partial value containing only the fields matching the filter, or `undefined` if none match.
 *
 * @category interop
 * @experimental 21.2.0
 */
export function extractValue<T>(
  field: FieldTree<T>,
  filter: ExtractFilter,
): DeepPartial<RawValue<T>>;
export function extractValue<T>(
  field: FieldTree<T>,
  filter?: ExtractFilter,
): RawValue<T> | DeepPartial<RawValue<T>> {
  return untracked(() => visitFieldTree(field, filter)) as RawValue<T> | DeepPartial<RawValue<T>>;
}

function visitFieldTree(
  field: FieldTree<unknown>,
  filter?: ExtractFilter,
): RawValue<unknown> | DeepPartial<RawValue<unknown>> {
  const state = field();
  const value = state.value();

  const matchingChildren = extractChildren(field, value, filter);

  if (matchingChildren !== undefined || isContainerNode(field, value)) {
    return matchingChildren;
  }

  if (matchesFilter(state, filter)) {
    return value;
  }

  return undefined;
}

function isContainerNode(field: FieldTree<unknown>, value: unknown): boolean {
  return (
    (isArray(value) || isObject(value)) &&
    Object.keys(value).some((k) => isFieldTreeNode(field[k as keyof FieldTree<unknown>]))
  );
}

function extractChildren(
  field: FieldTree<unknown>,
  value: unknown,
  filter?: ExtractFilter,
): unknown {
  if (isArray(value)) {
    const record = field as unknown as Record<number, FieldTree<unknown>>;
    const arrayValue = value as readonly FieldTree<unknown>[];
    const result: unknown[] = new Array(arrayValue.length);
    let hasMatch = false;

    for (let i = 0; i < arrayValue.length; i++) {
      const child = record[i];

      const childResult = visitFieldTree(child, filter);
      if (childResult !== undefined) {
        hasMatch = true;
      }
      result[i] = childResult;
    }

    return hasMatch ? result : undefined;
  }

  if (isObject(value)) {
    const record = field as unknown as Record<string, unknown>;
    const objectValue = value as Record<string, unknown>;
    const entries = Object.keys(objectValue)
      .map<[string, FieldTree<unknown>] | undefined>((key) => {
        const child = record[key];
        return isFieldTreeNode(child) ? [key, child] : undefined;
      })
      .filter(isKeyedChild)
      .map(([key, child]) => {
        const childResult = visitFieldTree(child, filter);
        return childResult !== undefined ? ([key, childResult] as [string, unknown]) : undefined;
      })
      .filter((v) => v !== undefined);

    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  return undefined;
}

function isFieldTreeNode(value: unknown): value is FieldTree<unknown> {
  return typeof value === 'function';
}

function isKeyedChild(
  value: [string, FieldTree<unknown>] | undefined,
): value is [string, FieldTree<unknown>] {
  return value !== undefined;
}

function matchesFilter(state: FieldState<unknown>, filter?: ExtractFilter): boolean {
  if (!filter) {
    return true;
  }

  if (filter.dirty !== undefined && state.dirty() !== filter.dirty) {
    return false;
  }

  if (filter.touched !== undefined && state.touched() !== filter.touched) {
    return false;
  }

  if (filter.enabled !== undefined) {
    const enabled = !state.disabled();
    if (enabled !== filter.enabled) {
      return false;
    }
  }

  return true;
}
