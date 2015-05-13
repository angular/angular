import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {PreGeneratedChangeDetection} from 'angular2/change_detection';

export function main() {
  describe("PreGeneratedChangeDetection", () => {
    it("sfs", () => {

      var rs = coalesce([
        r("user",  [],  0, 1, true),
        r("user",  [],  0, 2, true)
      ]);

      expect(rs[1]).toEqual(new ProtoRecord(
        RECORD_TYPE_SELF, "self", null,
        [], null, 1, null, 2,
        null, null,
        true, false)
      );
    });
  });
}
