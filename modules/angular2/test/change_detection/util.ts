import {isBlank, CONST_EXPR} from 'angular2/src/facade/lang';

export function iterableChangesAsString({collection = CONST_EXPR([]), previous = CONST_EXPR([]),
                                         additions = CONST_EXPR([]), moves = CONST_EXPR([]),
                                         removals = CONST_EXPR([])}) {
  return "collection: " + collection.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n";
}

export function kvChangesAsString({map, previous, additions, changes, removals}: {
  map?: List<any>,
  previous?: List<any>,
  additions?: List<any>,
  changes?: List<any>,
  removals?: List<any>
}): string {
  if (isBlank(map)) map = [];
  if (isBlank(previous)) previous = [];
  if (isBlank(additions)) additions = [];
  if (isBlank(changes)) changes = [];
  if (isBlank(removals)) removals = [];

  return "map: " + map.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n";
}
