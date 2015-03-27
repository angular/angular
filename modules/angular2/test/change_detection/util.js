import {isBlank} from 'angular2/src/facade/lang';

export function iterableChangesAsString({collection, previous, additions, moves, removals}) {
  if (isBlank(collection)) collection = [];
  if (isBlank(previous)) previous = [];
  if (isBlank(additions)) additions = [];
  if (isBlank(moves)) moves = [];
  if (isBlank(removals)) removals = [];

  return "collection: " + collection.join(', ') + "\n" +
         "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" +
         "moves: " + moves.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n";
}

export function kvChangesAsString({map, previous, additions, changes, removals}) {
  if (isBlank(map)) map = [];
  if (isBlank(previous)) previous = [];
  if (isBlank(additions)) additions = [];
  if (isBlank(changes)) changes = [];
  if (isBlank(removals)) removals = [];

  return "map: " + map.join(', ') + "\n" +
         "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" +
         "changes: " + changes.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n";
}
