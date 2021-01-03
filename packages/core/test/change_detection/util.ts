/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IterableChangeRecord, IterableChanges} from '@angular/core/src/change_detection/differs/iterable_differs';
import {KeyValueChangeRecord, KeyValueChanges} from '@angular/core/src/change_detection/differs/keyvalue_differs';

import {stringify} from '../../src/util/stringify';

export function iterableDifferToString<V>(iterableChanges: IterableChanges<V>) {
  const collection: string[] = [];
  iterableChanges.forEachItem(
      (record: IterableChangeRecord<V>) => collection.push(icrAsString(record)));

  const previous: string[] = [];
  iterableChanges.forEachPreviousItem(
      (record: IterableChangeRecord<V>) => previous.push(icrAsString(record)));

  const additions: string[] = [];
  iterableChanges.forEachAddedItem(
      (record: IterableChangeRecord<V>) => additions.push(icrAsString(record)));

  const moves: string[] = [];
  iterableChanges.forEachMovedItem(
      (record: IterableChangeRecord<V>) => moves.push(icrAsString(record)));

  const removals: string[] = [];
  iterableChanges.forEachRemovedItem(
      (record: IterableChangeRecord<V>) => removals.push(icrAsString(record)));

  const identityChanges: string[] = [];
  iterableChanges.forEachIdentityChange(
      (record: IterableChangeRecord<V>) => identityChanges.push(icrAsString(record)));

  return iterableChangesAsString(
      {collection, previous, additions, moves, removals, identityChanges});
}

function icrAsString<V>(icr: IterableChangeRecord<V>): string {
  return icr.previousIndex === icr.currentIndex ? stringify(icr.item) :
                                                  stringify(icr.item) + '[' +
          stringify(icr.previousIndex) + '->' + stringify(icr.currentIndex) + ']';
}

export function iterableChangesAsString({
  collection = [] as any,
  previous = [] as any,
  additions = [] as any,
  moves = [] as any,
  removals = [] as any,
  identityChanges = [] as any
}): string {
  return 'collection: ' + collection.join(', ') + '\n' +
      'previous: ' + previous.join(', ') + '\n' +
      'additions: ' + additions.join(', ') + '\n' +
      'moves: ' + moves.join(', ') + '\n' +
      'removals: ' + removals.join(', ') + '\n' +
      'identityChanges: ' + identityChanges.join(', ') + '\n';
}

function kvcrAsString(kvcr: KeyValueChangeRecord<string, any>) {
  return Object.is(kvcr.previousValue, kvcr.currentValue) ?
      stringify(kvcr.key) :
      (stringify(kvcr.key) + '[' + stringify(kvcr.previousValue) + '->' +
       stringify(kvcr.currentValue) + ']');
}

export function kvChangesAsString(kvChanges: KeyValueChanges<string, any>) {
  const map: string[] = [];
  const previous: string[] = [];
  const changes: string[] = [];
  const additions: string[] = [];
  const removals: string[] = [];

  kvChanges.forEachItem(r => map.push(kvcrAsString(r)));
  kvChanges.forEachPreviousItem(r => previous.push(kvcrAsString(r)));
  kvChanges.forEachChangedItem(r => changes.push(kvcrAsString(r)));
  kvChanges.forEachAddedItem(r => additions.push(kvcrAsString(r)));
  kvChanges.forEachRemovedItem(r => removals.push(kvcrAsString(r)));

  return testChangesAsString({map, previous, additions, changes, removals});
}

export function testChangesAsString(
    {map, previous, additions, changes, removals}:
        {map?: any[], previous?: any[], additions?: any[], changes?: any[], removals?: any[]}):
    string {
  if (!map) map = [];
  if (!previous) previous = [];
  if (!additions) additions = [];
  if (!changes) changes = [];
  if (!removals) removals = [];

  return 'map: ' + map.join(', ') + '\n' +
      'previous: ' + previous.join(', ') + '\n' +
      'additions: ' + additions.join(', ') + '\n' +
      'changes: ' + changes.join(', ') + '\n' +
      'removals: ' + removals.join(', ') + '\n';
}
