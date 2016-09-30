/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



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

export function kvChangesAsString(
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
