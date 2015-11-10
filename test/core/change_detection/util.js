var lang_1 = require('angular2/src/facade/lang');
function iterableChangesAsString(_a) {
    var _b = _a.collection, collection = _b === void 0 ? lang_1.CONST_EXPR([]) : _b, _c = _a.previous, previous = _c === void 0 ? lang_1.CONST_EXPR([]) : _c, _d = _a.additions, additions = _d === void 0 ? lang_1.CONST_EXPR([]) : _d, _e = _a.moves, moves = _e === void 0 ? lang_1.CONST_EXPR([]) : _e, _f = _a.removals, removals = _f === void 0 ? lang_1.CONST_EXPR([]) : _f;
    return "collection: " + collection.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
        "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" +
        "removals: " + removals.join(', ') + "\n";
}
exports.iterableChangesAsString = iterableChangesAsString;
function kvChangesAsString(_a) {
    var map = _a.map, previous = _a.previous, additions = _a.additions, changes = _a.changes, removals = _a.removals;
    if (lang_1.isBlank(map))
        map = [];
    if (lang_1.isBlank(previous))
        previous = [];
    if (lang_1.isBlank(additions))
        additions = [];
    if (lang_1.isBlank(changes))
        changes = [];
    if (lang_1.isBlank(removals))
        removals = [];
    return "map: " + map.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" +
        "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" +
        "removals: " + removals.join(', ') + "\n";
}
exports.kvChangesAsString = kvChangesAsString;
//# sourceMappingURL=util.js.map