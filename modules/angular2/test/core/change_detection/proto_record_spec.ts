import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';
import {isBlank} from 'angular2/src/facade/lang';

import {RecordType, ProtoRecord} from 'angular2/src/change_detection/proto_record';

export function main() {
  function r({lastInBinding, mode, name, directiveIndex, argumentToPureFunction, referencedBySelf}:
                 {
                   lastInBinding?: any,
                   mode?: any,
                   name?: any,
                   directiveIndex?: any,
                   argumentToPureFunction?: boolean,
                   referencedBySelf?: boolean
                 } = {}) {
    if (isBlank(lastInBinding)) lastInBinding = false;
    if (isBlank(mode)) mode = RecordType.PROPERTY_READ;
    if (isBlank(name)) name = "name";
    if (isBlank(directiveIndex)) directiveIndex = null;
    if (isBlank(argumentToPureFunction)) argumentToPureFunction = false;
    if (isBlank(referencedBySelf)) referencedBySelf = false;

    return new ProtoRecord(mode, name, null, [], null, 0, directiveIndex, 0, null, lastInBinding,
                           false, argumentToPureFunction, referencedBySelf, 0);
  }

  describe("ProtoRecord", () => {
    describe('shouldBeChecked', () => {
      it('should be true for pure functions', () => {
        expect(r({mode: RecordType.COLLECTION_LITERAL}).shouldBeChecked()).toBeTruthy();
      });

      it('should be true for args of pure functions', () => {
        expect(r({mode: RecordType.CONST, argumentToPureFunction: true}).shouldBeChecked())
            .toBeTruthy();
      });

      it('should be true for last in binding records', () => {
        expect(r({mode: RecordType.CONST, lastInBinding: true}).shouldBeChecked()).toBeTruthy();
      });

      it('should be false otherwise',
         () => { expect(r({mode: RecordType.CONST}).shouldBeChecked()).toBeFalsy(); });
    });

    describe('isUsedByOtherRecord', () => {
      it('should be false for lastInBinding records',
         () => { expect(r({lastInBinding: true}).isUsedByOtherRecord()).toBeFalsy(); });

      it('should be true for lastInBinding records that are referenced by self records', () => {
        expect(r({lastInBinding: true, referencedBySelf: true}).isUsedByOtherRecord()).toBeTruthy();
      });

      it('should be true for non lastInBinding records',
         () => { expect(r({lastInBinding: false}).isUsedByOtherRecord()).toBeTruthy(); });
    });
  });
}
