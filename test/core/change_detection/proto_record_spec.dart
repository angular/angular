library angular2.test.core.change_detection.proto_record_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach;
import "package:angular2/src/facade/lang.dart" show isBlank;
import "package:angular2/src/core/change_detection/proto_record.dart"
    show RecordType, ProtoRecord;

main() {
  r(
      {lastInBinding,
      mode,
      name,
      directiveIndex,
      argumentToPureFunction,
      referencedBySelf}) {
    if (isBlank(lastInBinding)) lastInBinding = false;
    if (isBlank(mode)) mode = RecordType.PropertyRead;
    if (isBlank(name)) name = "name";
    if (isBlank(directiveIndex)) directiveIndex = null;
    if (isBlank(argumentToPureFunction)) argumentToPureFunction = false;
    if (isBlank(referencedBySelf)) referencedBySelf = false;
    return new ProtoRecord(
        mode,
        name,
        null,
        [],
        null,
        0,
        directiveIndex,
        0,
        null,
        lastInBinding,
        false,
        argumentToPureFunction,
        referencedBySelf,
        0);
  }
  describe("ProtoRecord", () {
    describe("shouldBeChecked", () {
      it("should be true for pure functions", () {
        expect(r(mode: RecordType.CollectionLiteral).shouldBeChecked())
            .toBeTruthy();
      });
      it("should be true for args of pure functions", () {
        expect(r(mode: RecordType.Const, argumentToPureFunction: true)
            .shouldBeChecked()).toBeTruthy();
      });
      it("should be true for last in binding records", () {
        expect(r(mode: RecordType.Const, lastInBinding: true).shouldBeChecked())
            .toBeTruthy();
      });
      it("should be false otherwise", () {
        expect(r(mode: RecordType.Const).shouldBeChecked()).toBeFalsy();
      });
    });
    describe("isUsedByOtherRecord", () {
      it("should be false for lastInBinding records", () {
        expect(r(lastInBinding: true).isUsedByOtherRecord()).toBeFalsy();
      });
      it("should be true for lastInBinding records that are referenced by self records",
          () {
        expect(r(lastInBinding: true, referencedBySelf: true)
            .isUsedByOtherRecord()).toBeTruthy();
      });
      it("should be true for non lastInBinding records", () {
        expect(r(lastInBinding: false).isUsedByOtherRecord()).toBeTruthy();
      });
    });
  });
}
