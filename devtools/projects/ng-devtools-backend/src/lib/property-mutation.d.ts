/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Mutates the nested property under the provided object and assigns the new value.
 * Supports both plain objects/arrays as well deep mutations within a signal.
 *
 * @param obj The object to assign to.
 * @param keyPath An array of strings representing nested properties to be
 *     assigned.
 * @param newValue The value to assign.
 *
 * Example:
 *
 * ```typescript
 * const obj = {foo: {bar: [1]}};
 * mutateNestedProp(obj, ['foo', 'bar', '0'], 2);
 * obj.foo.bar[0]; // 2
 * ```
 *
 * When no signals are present, this performs a basic property assignment.
 *
 * ```typescript
 * mutateNestedProp(obj, ['foo', 'bar', '0'], 1);
 * // Equivalent to:
 * obj.foo.bar[0] = 1;
 * ```
 *
 * Signals are handled by performing an immutable copy of their contents.
 *
 * ```typescript
 * mutateNestedProp(obj, ['foo', 'bar', '1'], 2);
 * // If `foo` is a signal, equivalent to:
 * obj.foo.set({
 *   ...obj.foo(),
 *   bar: [
 *     ...obj.foo().bar.slice(0, 1),
 *     2,
 *     ...obj.foo().bar.slice(2),
 *   ],
 * });
 * ```
 *
 * The algorithm works by walking the full list of properties and looking for a
 * signal function. If one is found, we apply an immutable update on its contents
 * and call `.set` with the result. If no signals are found, we get the last
 * receiver in the chain and assign the value directly
 * (`receiver[prop] = newValue;`).
 */
export declare function mutateNestedProp(obj: any, keyPath: string[], newValue: unknown): void;
