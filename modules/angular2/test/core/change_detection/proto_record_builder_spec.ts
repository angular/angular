import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  inject
} from 'angular2/test_lib';

import {ProtoRecordBuilder} from 'angular2/src/core/change_detection/proto_change_detector';
import {BindingRecord} from 'angular2/src/core/change_detection/binding_record';
import {Parser} from 'angular2/src/core/change_detection/parser/parser';

export function main() {
  describe("ProtoRecordBuilder", () => {
    it('should set argumentToPureFunction flag', inject([Parser], (p: Parser) => {
         var builder = new ProtoRecordBuilder();
         var ast = p.parseBinding("[1,2]", "location");  // collection literal is a pure function
         builder.add(BindingRecord.createForElementProperty(ast, 0, "property"), [], 0);

         var isPureFunc = builder.records.map(r => r.argumentToPureFunction);
         expect(isPureFunc).toEqual([true, true, false]);
       }));

    it('should not set argumentToPureFunction flag when not needed',
       inject([Parser], (p: Parser) => {
         var builder = new ProtoRecordBuilder();
         var ast = p.parseBinding("f(1,2)", "location");
         builder.add(BindingRecord.createForElementProperty(ast, 0, "property"), [], 0);

         var isPureFunc = builder.records.map(r => r.argumentToPureFunction);
         expect(isPureFunc).toEqual([false, false, false]);
       }));
  });
}
