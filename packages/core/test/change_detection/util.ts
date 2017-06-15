/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyValueChangeRecord, KeyValueChanges} from '@angular/core/src/change_detection/differs/keyvalue_differs';

import {looseIdentical, stringify} from '../../src/util';


export function iterableChangesAsString(
    {collection = [] as any, previous = [] as any, additions = [] as any, moves = [] as any,
     removals = [] as any, identityChanges = [] as any}): string {
  return 'collection: ' + collection.join(', ') + '\n' +
      'previous: ' + previous.join(', ') + '\n' +
      'additions: ' + additions.join(', ') + '\n' +
      'moves: ' + moves.join(', ') + '\n' +
      'removals: ' + removals.join(', ') + '\n' +
      'identityChanges: ' + identityChanges.join(', ') + '\n';
}

function kvcrAsString(kvcr: KeyValueChangeRecord<string, any>) {
  return looseIdentical(kvcr.previousValue, kvcr.currentValue) ?
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
