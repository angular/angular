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
export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? {[K in keyof T]?: DeepPartial<T[K]>}
    : T;

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
 * @param filter Optional predicate to include only fields matching certain criteria.
 * @returns The raw value of the field tree, or a partial value if filtering is applied.
 *
 * @category interop
 * @experimental 21.2.0
 */
export function extractValue<T>(field: FieldTree<T>): RawValue<T>;
export function extractValue<T>(
  field: FieldTree<T>,
  filter: ExtractFilter,
): DeepPartial<RawValue<T>> | undefined;
export function extractValue<T>(
  field: FieldTree<T>,
  filter?: ExtractFilter,
): RawValue<T> | DeepPartial<RawValue<T>> | undefined;
export function extractValue<T>(
  field: FieldTree<T>,
  filter?: ExtractFilter,
): RawValue<T> | DeepPartial<RawValue<T>> | undefined {
  return visitFieldTree(field, filter) as RawValue<T> | DeepPartial<RawValue<T>> | undefined;
}

function visitFieldTree(
  field: FieldTree<unknown>,
  filter?: ExtractFilter,
): RawValue<unknown> | DeepPartial<RawValue<unknown>> | undefined {
  return untracked(() => {
    const state = field();
    const value = state.value();

    if (!matchesFilter(state, filter)) {
      return undefined;
    }

    const extracted = extractChildren(field, value, filter);
    return hasChildren(extracted) ? extracted : value;
  });
}

function extractChildren(
  field: FieldTree<unknown>,
  value: unknown,
  filter?: ExtractFilter,
): unknown {
  if (isArray(value)) {
    const record = field as unknown as Record<number, unknown>;
    const arrayValue = value as readonly unknown[];
    const result: unknown[] = new Array(arrayValue.length);
    let hasMatch = false;

    for (let i = 0; i < arrayValue.length; i++) {
      const child = record[i];
      if (!isFieldTreeNode(child)) {
        result[i] = undefined;
        continue;
      }
      const extracted = visitFieldTree(child, filter);
      if (hasChildren(extracted)) {
        hasMatch = true;
      }
      result[i] = extracted;
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
        const extracted = visitFieldTree(child, filter);
        return hasChildren(extracted) ? ([key, extracted] as [string, unknown]) : undefined;
      })
      .filter(isKeyedResult);

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

function isKeyedResult(value: [string, unknown] | undefined): value is [string, unknown] {
  return value !== undefined;
}

function hasChildren(value: unknown): value is Exclude<unknown, undefined> {
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
