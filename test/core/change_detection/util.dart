library angular2.test.core.change_detection.util;

import "package:angular2/src/facade/lang.dart" show isBlank;

iterableChangesAsString(
    {collection: const [],
    previous: const [],
    additions: const [],
    moves: const [],
    removals: const []}) {
  return "collection: " +
      collection.join(", ") +
      "\n" +
      "previous: " +
      previous.join(", ") +
      "\n" +
      "additions: " +
      additions.join(", ") +
      "\n" +
      "moves: " +
      moves.join(", ") +
      "\n" +
      "removals: " +
      removals.join(", ") +
      "\n";
}

String kvChangesAsString({map, previous, additions, changes, removals}) {
  if (isBlank(map)) map = [];
  if (isBlank(previous)) previous = [];
  if (isBlank(additions)) additions = [];
  if (isBlank(changes)) changes = [];
  if (isBlank(removals)) removals = [];
  return "map: " +
      map.join(", ") +
      "\n" +
      "previous: " +
      previous.join(", ") +
      "\n" +
      "additions: " +
      additions.join(", ") +
      "\n" +
      "changes: " +
      changes.join(", ") +
      "\n" +
      "removals: " +
      removals.join(", ") +
      "\n";
}
