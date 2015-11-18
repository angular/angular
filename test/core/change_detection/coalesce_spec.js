var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var coalesce_1 = require('angular2/src/core/change_detection/coalesce');
var proto_record_1 = require('angular2/src/core/change_detection/proto_record');
var directive_record_1 = require('angular2/src/core/change_detection/directive_record');
function main() {
    function r(funcOrValue, args, contextIndex, selfIndex, _a) {
        var _b = _a === void 0 ? {} : _a, lastInBinding = _b.lastInBinding, mode = _b.mode, name = _b.name, directiveIndex = _b.directiveIndex, argumentToPureFunction = _b.argumentToPureFunction, fixedArgs = _b.fixedArgs;
        if (lang_1.isBlank(lastInBinding))
            lastInBinding = false;
        if (lang_1.isBlank(mode))
            mode = proto_record_1.RecordType.PropertyRead;
        if (lang_1.isBlank(name))
            name = "name";
        if (lang_1.isBlank(directiveIndex))
            directiveIndex = null;
        if (lang_1.isBlank(argumentToPureFunction))
            argumentToPureFunction = false;
        if (lang_1.isBlank(fixedArgs))
            fixedArgs = null;
        return new proto_record_1.ProtoRecord(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex, selfIndex, null, lastInBinding, false, argumentToPureFunction, false, 0);
    }
    testing_internal_1.describe("change detection - coalesce", function () {
        testing_internal_1.it("should work with an empty list", function () { testing_internal_1.expect(coalesce_1.coalesce([])).toEqual([]); });
        testing_internal_1.it("should remove non-terminal duplicate records and update the context indices referencing them", function () {
            var rs = coalesce_1.coalesce([r("user", [], 0, 1), r("first", [], 1, 2), r("user", [], 0, 3), r("last", [], 3, 4)]);
            testing_internal_1.expect(rs).toEqual([r("user", [], 0, 1), r("first", [], 1, 2), r("last", [], 1, 3)]);
        });
        testing_internal_1.it("should update indices of other records", function () {
            var rs = coalesce_1.coalesce([r("dup", [], 0, 1), r("dup", [], 0, 2), r("user", [], 0, 3), r("first", [3], 3, 4)]);
            testing_internal_1.expect(rs).toEqual([r("dup", [], 0, 1), r("user", [], 0, 2), r("first", [2], 2, 3)]);
        });
        testing_internal_1.it("should remove non-terminal duplicate records and update the args indices referencing them", function () {
            var rs = coalesce_1.coalesce([
                r("user1", [], 0, 1),
                r("user2", [], 0, 2),
                r("hi", [1], 0, 3),
                r("hi", [1], 0, 4),
                r("hi", [2], 0, 5)
            ]);
            testing_internal_1.expect(rs).toEqual([r("user1", [], 0, 1), r("user2", [], 0, 2), r("hi", [1], 0, 3), r("hi", [2], 0, 4)]);
        });
        testing_internal_1.it("should replace duplicate terminal records with self records", function () {
            var rs = coalesce_1.coalesce([r("user", [], 0, 1, { lastInBinding: true }), r("user", [], 0, 2, { lastInBinding: true })]);
            testing_internal_1.expect(rs[1]).toEqual(new proto_record_1.ProtoRecord(proto_record_1.RecordType.Self, "self", null, [], null, 1, null, 2, null, true, false, false, false, 0));
        });
        testing_internal_1.it("should set referencedBySelf", function () {
            var rs = coalesce_1.coalesce([r("user", [], 0, 1, { lastInBinding: true }), r("user", [], 0, 2, { lastInBinding: true })]);
            testing_internal_1.expect(rs[0].referencedBySelf).toBeTruthy();
        });
        testing_internal_1.it("should not coalesce directive lifecycle records", function () {
            var rs = coalesce_1.coalesce([
                r("doCheck", [], 0, 1, { mode: proto_record_1.RecordType.DirectiveLifecycle }),
                r("doCheck", [], 0, 1, { mode: proto_record_1.RecordType.DirectiveLifecycle })
            ]);
            testing_internal_1.expect(rs.length).toEqual(2);
        });
        testing_internal_1.it("should not coalesce protos with different names but same value", function () {
            var nullFunc = function () { };
            var rs = coalesce_1.coalesce([
                r(nullFunc, [], 0, 1, { name: "foo" }),
                r(nullFunc, [], 0, 1, { name: "bar" }),
            ]);
            testing_internal_1.expect(rs.length).toEqual(2);
        });
        testing_internal_1.it("should not coalesce protos with the same context index but different directive indices", function () {
            var nullFunc = function () { };
            var rs = coalesce_1.coalesce([
                r(nullFunc, [], 0, 1, { directiveIndex: new directive_record_1.DirectiveIndex(0, 0) }),
                r(nullFunc, [], 0, 1, { directiveIndex: new directive_record_1.DirectiveIndex(0, 1) }),
                r(nullFunc, [], 0, 1, { directiveIndex: new directive_record_1.DirectiveIndex(1, 0) }),
                r(nullFunc, [], 0, 1, { directiveIndex: null }),
            ]);
            testing_internal_1.expect(rs.length).toEqual(4);
        });
        testing_internal_1.it('should preserve the argumentToPureFunction property', function () {
            var rs = coalesce_1.coalesce([
                r("user", [], 0, 1),
                r("user", [], 0, 2, { argumentToPureFunction: true }),
                r("user", [], 0, 3),
                r("name", [], 3, 4)
            ]);
            testing_internal_1.expect(rs)
                .toEqual([r("user", [], 0, 1, { argumentToPureFunction: true }), r("name", [], 1, 2)]);
        });
        testing_internal_1.it('should preserve the argumentToPureFunction property (the original record)', function () {
            var rs = coalesce_1.coalesce([
                r("user", [], 0, 1, { argumentToPureFunction: true }),
                r("user", [], 0, 2),
                r("name", [], 2, 3)
            ]);
            testing_internal_1.expect(rs)
                .toEqual([r("user", [], 0, 1, { argumentToPureFunction: true }), r("name", [], 1, 2)]);
        });
        testing_internal_1.describe('short-circuit', function () {
            testing_internal_1.it('should not use short-circuitable records', function () {
                var records = [
                    r("sknot", [], 0, 1, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [3] }),
                    r("a", [], 0, 2),
                    r("sk", [], 0, 3, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [4] }),
                    r("b", [], 0, 4),
                    r("cond", [2, 4], 0, 5),
                    r("a", [], 0, 6),
                    r("b", [], 0, 7),
                ];
                testing_internal_1.expect(coalesce_1.coalesce(records)).toEqual(records);
            });
            testing_internal_1.it('should not use short-circuitable records from nested short-circuits', function () {
                var records = [
                    r("sknot outer", [], 0, 1, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [7] }),
                    r("sknot inner", [], 0, 2, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [4] }),
                    r("a", [], 0, 3),
                    r("sk inner", [], 0, 4, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [5] }),
                    r("b", [], 0, 5),
                    r("cond-inner", [3, 5], 0, 6),
                    r("sk outer", [], 0, 7, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [8] }),
                    r("c", [], 0, 8),
                    r("cond-outer", [6, 8], 0, 9),
                    r("a", [], 0, 10),
                    r("b", [], 0, 11),
                    r("c", [], 0, 12),
                ];
                testing_internal_1.expect(coalesce_1.coalesce(records)).toEqual(records);
            });
            testing_internal_1.it('should collapse the true branch', function () {
                var rs = coalesce_1.coalesce([
                    r("a", [], 0, 1),
                    r("sknot", [], 0, 2, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [4] }),
                    r("a", [], 0, 3),
                    r("sk", [], 0, 4, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [6] }),
                    r("a", [], 0, 5),
                    r("b", [], 5, 6),
                    r("cond", [3, 6], 0, 7),
                ]);
                testing_internal_1.expect(rs).toEqual([
                    r("a", [], 0, 1),
                    r("sknot", [], 0, 2, { mode: proto_record_1.RecordType.SkipRecordsIf, fixedArgs: [3] }),
                    r("b", [], 1, 3),
                    r("cond", [1, 3], 0, 4),
                ]);
            });
            testing_internal_1.it('should collapse the false branch', function () {
                var rs = coalesce_1.coalesce([
                    r("a", [], 0, 1),
                    r("sknot", [], 0, 2, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [5] }),
                    r("a", [], 0, 3),
                    r("b", [], 3, 4),
                    r("sk", [], 0, 5, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [6] }),
                    r("a", [], 0, 6),
                    r("cond", [4, 6], 0, 7),
                ]);
                testing_internal_1.expect(rs).toEqual([
                    r("a", [], 0, 1),
                    r("sknot", [], 0, 2, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [3] }),
                    r("b", [], 1, 3),
                    r("cond", [3, 1], 0, 4),
                ]);
            });
            testing_internal_1.it('should optimize skips', function () {
                var rs = coalesce_1.coalesce([
                    // skipIfNot(1) + skip(N) -> skipIf(+N)
                    r("sknot", [], 0, 1, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [2] }),
                    r("sk", [], 0, 2, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [3] }),
                    r("a", [], 0, 3),
                    // skipIf(1) + skip(N) -> skipIfNot(N)
                    r("skif", [], 0, 4, { mode: proto_record_1.RecordType.SkipRecordsIf, fixedArgs: [5] }),
                    r("sk", [], 0, 5, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [6] }),
                    r("b", [], 0, 6),
                    // remove empty skips
                    r("sknot", [], 0, 7, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [7] }),
                    r("skif", [], 0, 8, { mode: proto_record_1.RecordType.SkipRecordsIf, fixedArgs: [8] }),
                    r("sk", [], 0, 9, { mode: proto_record_1.RecordType.SkipRecords, fixedArgs: [9] }),
                    r("end", [], 0, 10),
                ]);
                testing_internal_1.expect(rs).toEqual([
                    r("sknot", [], 0, 1, { mode: proto_record_1.RecordType.SkipRecordsIf, fixedArgs: [2] }),
                    r("a", [], 0, 2),
                    r("skif", [], 0, 3, { mode: proto_record_1.RecordType.SkipRecordsIfNot, fixedArgs: [4] }),
                    r("b", [], 0, 4),
                    r("end", [], 0, 5),
                ]);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=coalesce_spec.js.map