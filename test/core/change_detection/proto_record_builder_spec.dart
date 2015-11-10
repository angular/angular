library angular2.test.core.change_detection.proto_record_builder_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        inject;
import "package:angular2/src/core/change_detection/proto_change_detector.dart"
    show ProtoRecordBuilder;
import "package:angular2/src/core/change_detection/binding_record.dart"
    show BindingRecord;
import "package:angular2/src/core/change_detection/parser/parser.dart"
    show Parser;

main() {
  describe("ProtoRecordBuilder", () {
    it(
        "should set argumentToPureFunction flag",
        inject([Parser], (Parser p) {
          var builder = new ProtoRecordBuilder();
          var ast = p.parseBinding("[1,2]", "location");
          builder.add(
              BindingRecord.createForElementProperty(ast, 0, "property"),
              [],
              0);
          var isPureFunc =
              builder.records.map((r) => r.argumentToPureFunction).toList();
          expect(isPureFunc).toEqual([true, true, false]);
        }));
    it(
        "should not set argumentToPureFunction flag when not needed",
        inject([Parser], (Parser p) {
          var builder = new ProtoRecordBuilder();
          var ast = p.parseBinding("f(1,2)", "location");
          builder.add(
              BindingRecord.createForElementProperty(ast, 0, "property"),
              [],
              0);
          var isPureFunc =
              builder.records.map((r) => r.argumentToPureFunction).toList();
          expect(isPureFunc).toEqual([false, false, false]);
        }));
  });
}
