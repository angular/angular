/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { KeyValueDiffers, PipeTransform } from '@angular/core';
/**
 * A key value pair.
 * Usually used to represent the key value pairs from a Map or Object.
 *
 * @publicApi
 */
export interface KeyValue<K, V> {
    key: K;
    value: V;
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 * Passing `null` as the compareFn will use natural ordering of the input.
 *
 * @usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this
 * keyvalue pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
export declare class KeyValuePipe implements PipeTransform {
    private readonly differs;
    constructor(differs: KeyValueDiffers);
    private differ;
    private keyValues;
    private compareFn;
    transform<K, V>(input: ReadonlyMap<K, V>, compareFn?: ((a: KeyValue<K, V>, b: KeyValue<K, V>) => number) | null): Array<KeyValue<K, V>>;
    transform<K extends number, V>(input: Record<K, V>, compareFn?: ((a: KeyValue<string, V>, b: KeyValue<string, V>) => number) | null): Array<KeyValue<string, V>>;
    transform<K extends string, V>(input: Record<K, V> | ReadonlyMap<K, V>, compareFn?: ((a: KeyValue<K, V>, b: KeyValue<K, V>) => number) | null): Array<KeyValue<K, V>>;
    transform(input: null | undefined, compareFn?: ((a: KeyValue<unknown, unknown>, b: KeyValue<unknown, unknown>) => number) | null): null;
    transform<K, V>(input: ReadonlyMap<K, V> | null | undefined, compareFn?: ((a: KeyValue<K, V>, b: KeyValue<K, V>) => number) | null): Array<KeyValue<K, V>> | null;
    transform<K extends number, V>(input: Record<K, V> | null | undefined, compareFn?: ((a: KeyValue<string, V>, b: KeyValue<string, V>) => number) | null): Array<KeyValue<string, V>> | null;
    transform<K extends string, V>(input: Record<K, V> | ReadonlyMap<K, V> | null | undefined, compareFn?: ((a: KeyValue<K, V>, b: KeyValue<K, V>) => number) | null): Array<KeyValue<K, V>> | null;
}
export declare function defaultComparator<K, V>(keyValueA: KeyValue<K, V>, keyValueB: KeyValue<K, V>): number;
