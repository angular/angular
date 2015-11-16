import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';
import {isBlank} from 'angular2/src/facade/lang';

import {coalesce} from 'angular2/src/core/change_detection/coalesce';
import {RecordType, ProtoRecord} from 'angular2/src/core/change_detection/proto_record';
import {DirectiveIndex} from 'angular2/src/core/change_detection/directive_record';

export function main() {
  function r(funcOrValue, args, contextIndex, selfIndex,
             {lastInBinding, mode, name, directiveIndex, argumentToPureFunction, fixedArgs}: {
               lastInBinding?: any,
               mode?: any,
               name?: any,
               directiveIndex?: any,
               argumentToPureFunction?: boolean,
               fixedArgs?: any[]
             } = {}) {
    if (isBlank(lastInBinding)) lastInBinding = false;
    if (isBlank(mode)) mode = RecordType.PropertyRead;
    if (isBlank(name)) name = "name";
    if (isBlank(directiveIndex)) directiveIndex = null;
    if (isBlank(argumentToPureFunction)) argumentToPureFunction = false;
    if (isBlank(fixedArgs)) fixedArgs = null;

    return new ProtoRecord(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex,
                           selfIndex, null, lastInBinding, false, argumentToPureFunction, false, 0);
  }

  describe("change detection - coalesce", () => {
    it("should work with an empty list", () => { expect(coalesce([])).toEqual([]); });

    it("should remove non-terminal duplicate records and update the context indices referencing them",
       () => {
         var rs = coalesce(
             [r("user", [], 0, 1), r("first", [], 1, 2), r("user", [], 0, 3), r("last", [], 3, 4)]);

         expect(rs).toEqual([r("user", [], 0, 1), r("first", [], 1, 2), r("last", [], 1, 3)]);
       });

    it("should update indices of other records", () => {
      var rs = coalesce(
          [r("dup", [], 0, 1), r("dup", [], 0, 2), r("user", [], 0, 3), r("first", [3], 3, 4)]);

      expect(rs).toEqual([r("dup", [], 0, 1), r("user", [], 0, 2), r("first", [2], 2, 3)]);
    });

    it("should remove non-terminal duplicate records and update the args indices referencing them",
       () => {
         var rs = coalesce([
           r("user1", [], 0, 1),
           r("user2", [], 0, 2),
           r("hi", [1], 0, 3),
           r("hi", [1], 0, 4),
           r("hi", [2], 0, 5)
         ]);

         expect(rs).toEqual(
             [r("user1", [], 0, 1), r("user2", [], 0, 2), r("hi", [1], 0, 3), r("hi", [2], 0, 4)]);
       });

    it("should replace duplicate terminal records with self records", () => {
      var rs = coalesce(
          [r("user", [], 0, 1, {lastInBinding: true}), r("user", [], 0, 2, {lastInBinding: true})]);

      expect(rs[1]).toEqual(new ProtoRecord(RecordType.Self, "self", null, [], null, 1, null, 2,
                                            null, true, false, false, false, 0));
    });

    it("should set referencedBySelf", () => {
      var rs = coalesce(
          [r("user", [], 0, 1, {lastInBinding: true}), r("user", [], 0, 2, {lastInBinding: true})]);

      expect(rs[0].referencedBySelf).toBeTruthy();
    });

    it("should not coalesce directive lifecycle records", () => {
      var rs = coalesce([
        r("doCheck", [], 0, 1, {mode: RecordType.DirectiveLifecycle}),
        r("doCheck", [], 0, 1, {mode: RecordType.DirectiveLifecycle})
      ]);

      expect(rs.length).toEqual(2);
    });

    it("should not coalesce protos with different names but same value", () => {
      var nullFunc = () => {};
      var rs = coalesce([
        r(nullFunc, [], 0, 1, {name: "foo"}),
        r(nullFunc, [], 0, 1, {name: "bar"}),
      ]);
      expect(rs.length).toEqual(2);
    });

    it("should not coalesce protos with the same context index but different directive indices",
       () => {
         var nullFunc = () => {};
         var rs = coalesce([
           r(nullFunc, [], 0, 1, {directiveIndex: new DirectiveIndex(0, 0)}),
           r(nullFunc, [], 0, 1, {directiveIndex: new DirectiveIndex(0, 1)}),
           r(nullFunc, [], 0, 1, {directiveIndex: new DirectiveIndex(1, 0)}),
           r(nullFunc, [], 0, 1, {directiveIndex: null}),
         ]);
         expect(rs.length).toEqual(4);
       });

    it('should preserve the argumentToPureFunction property', () => {
      var rs = coalesce([
        r("user", [], 0, 1),
        r("user", [], 0, 2, {argumentToPureFunction: true}),
        r("user", [], 0, 3),
        r("name", [], 3, 4)
      ]);
      expect(rs)
          .toEqual([r("user", [], 0, 1, {argumentToPureFunction: true}), r("name", [], 1, 2)]);
    });

    it('should preserve the argumentToPureFunction property (the original record)', () => {
      var rs = coalesce([
        r("user", [], 0, 1, {argumentToPureFunction: true}),
        r("user", [], 0, 2),
        r("name", [], 2, 3)
      ]);
      expect(rs)
          .toEqual([r("user", [], 0, 1, {argumentToPureFunction: true}), r("name", [], 1, 2)]);
    });

    describe('short-circuit', () => {
      it('should not use short-circuitable records', () => {
        var records = [
          r("sknot", [], 0, 1, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [3]}),
          r("a", [], 0, 2),
          r("sk", [], 0, 3, {mode: RecordType.SkipRecords, fixedArgs: [4]}),
          r("b", [], 0, 4),
          r("cond", [2, 4], 0, 5),
          r("a", [], 0, 6),
          r("b", [], 0, 7),
        ];

        expect(coalesce(records)).toEqual(records);
      });

      it('should not use short-circuitable records from nested short-circuits', () => {
        var records = [
          r("sknot outer", [], 0, 1, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [7]}),
          r("sknot inner", [], 0, 2, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [4]}),
          r("a", [], 0, 3),
          r("sk inner", [], 0, 4, {mode: RecordType.SkipRecords, fixedArgs: [5]}),
          r("b", [], 0, 5),
          r("cond-inner", [3, 5], 0, 6),
          r("sk outer", [], 0, 7, {mode: RecordType.SkipRecords, fixedArgs: [8]}),
          r("c", [], 0, 8),
          r("cond-outer", [6, 8], 0, 9),
          r("a", [], 0, 10),
          r("b", [], 0, 11),
          r("c", [], 0, 12),
        ];

        expect(coalesce(records)).toEqual(records);
      });

      it('should collapse the true branch', () => {
        var rs = coalesce([
          r("a", [], 0, 1),
          r("sknot", [], 0, 2, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [4]}),
          r("a", [], 0, 3),
          r("sk", [], 0, 4, {mode: RecordType.SkipRecords, fixedArgs: [6]}),
          r("a", [], 0, 5),
          r("b", [], 5, 6),
          r("cond", [3, 6], 0, 7),
        ]);

        expect(rs).toEqual([
          r("a", [], 0, 1),
          r("sknot", [], 0, 2, {mode: RecordType.SkipRecordsIf, fixedArgs: [3]}),
          r("b", [], 1, 3),
          r("cond", [1, 3], 0, 4),
        ]);
      });

      it('should collapse the false branch', () => {
        var rs = coalesce([
          r("a", [], 0, 1),
          r("sknot", [], 0, 2, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [5]}),
          r("a", [], 0, 3),
          r("b", [], 3, 4),
          r("sk", [], 0, 5, {mode: RecordType.SkipRecords, fixedArgs: [6]}),
          r("a", [], 0, 6),
          r("cond", [4, 6], 0, 7),
        ]);

        expect(rs).toEqual([
          r("a", [], 0, 1),
          r("sknot", [], 0, 2, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [3]}),
          r("b", [], 1, 3),
          r("cond", [3, 1], 0, 4),
        ]);
      });

      it('should optimize skips', () => {
        var rs = coalesce([
          // skipIfNot(1) + skip(N) -> skipIf(+N)
          r("sknot", [], 0, 1, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [2]}),
          r("sk", [], 0, 2, {mode: RecordType.SkipRecords, fixedArgs: [3]}),
          r("a", [], 0, 3),
          // skipIf(1) + skip(N) -> skipIfNot(N)
          r("skif", [], 0, 4, {mode: RecordType.SkipRecordsIf, fixedArgs: [5]}),
          r("sk", [], 0, 5, {mode: RecordType.SkipRecords, fixedArgs: [6]}),
          r("b", [], 0, 6),
          // remove empty skips
          r("sknot", [], 0, 7, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [7]}),
          r("skif", [], 0, 8, {mode: RecordType.SkipRecordsIf, fixedArgs: [8]}),
          r("sk", [], 0, 9, {mode: RecordType.SkipRecords, fixedArgs: [9]}),
          r("end", [], 0, 10),
        ]);

        expect(rs).toEqual([
          r("sknot", [], 0, 1, {mode: RecordType.SkipRecordsIf, fixedArgs: [2]}),
          r("a", [], 0, 2),
          r("skif", [], 0, 3, {mode: RecordType.SkipRecordsIfNot, fixedArgs: [4]}),
          r("b", [], 0, 4),
          r("end", [], 0, 5),
        ]);
      });
    });
  });
}
