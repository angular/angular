import {isBlank} from '../../src/facade/lang';

export function iterableChangesAsString(
    {collection = /*@ts2dart_const*/[], previous = /*@ts2dart_const*/[],
     additions = /*@ts2dart_const*/[], moves = /*@ts2dart_const*/[],
     removals = /*@ts2dart_const*/[], identityChanges = /*@ts2dart_const*/[]}) {
  return "collection: " + collection.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n" + "identityChanges: " +
         identityChanges.join(', ') + "\n";
}

export function kvChangesAsString(
    {map, previous, additions, changes, removals}:
        {map?: any[], previous?: any[], additions?: any[], changes?: any[], removals?: any[]}):
    string {
  if (isBlank(map)) map = [];
  if (isBlank(previous)) previous = [];
  if (isBlank(additions)) additions = [];
  if (isBlank(changes)) changes = [];
  if (isBlank(removals)) removals = [];

  return "map: " + map.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n";
}
