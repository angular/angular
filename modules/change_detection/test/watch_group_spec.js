import {ddescribe, describe, it, iit, xit, expect} from 'test_lib/test_lib';

import {List, ListWrapper, MapWrapper} from 'facade/collection';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ClosureMap} from 'change_detection/parser/closure_map';

import {
  ChangeDetector,
  ProtoWatchGroup,
  WatchGroup,
  WatchGroupDispatcher,
  ProtoRecord
} from 'change_detection/change_detector';

import {Record} from 'change_detection/record';

export function main() {
  function createRecord(wg) {
    return new Record(wg, new ProtoRecord(null, null, null, null, null), null);
  }

  describe('watch group', () => {
    describe("adding records", () => {
      it("should add a record", () => {
        var wg = new WatchGroup(null, null);
        var record = createRecord(wg);

        wg.addRecord(record);

        expect(wg.headRecord).toBe(record);
        expect(wg.tailRecord).toBe(record);
        expect(wg.headEnabledRecord).toBe(record);
        expect(wg.tailEnabledRecord).toBe(record);
      });

      it("should add multiple records", () => {
        var wg = new WatchGroup(null, null);
        var record1 = createRecord(wg);
        var record2 = createRecord(wg);

        wg.addRecord(record1);
        wg.addRecord(record2);

        expect(wg.headRecord).toBe(record1);
        expect(wg.tailRecord).toBe(record2);

        expect(wg.headEnabledRecord).toBe(record1);
        expect(wg.tailEnabledRecord).toBe(record2);

        expect(record1.next).toBe(record2);
        expect(record2.prev).toBe(record1);
      });
    });

    describe("enabling/disabling records", () => {
      it("should disable a single record", () => {
        var wg = new WatchGroup(null, null);
        var record = createRecord(wg);
        wg.addRecord(record);

        wg.disableRecord(record);

        expect(wg.headEnabledRecord).toBeNull();
        expect(wg.tailEnabledRecord).toBeNull();
      });

      it("should enable a single record", () => {
        var wg = new WatchGroup(null, null);
        var record = createRecord(wg);
        wg.addRecord(record);
        wg.disableRecord(record);

        wg.enableRecord(record);

        expect(wg.headEnabledRecord).toBe(record);
        expect(wg.tailEnabledRecord).toBe(record);
      });

      it("should disable a record", () => {
        var wg = new WatchGroup(null, null);
        var record1 = createRecord(wg);
        var record2 = createRecord(wg);
        var record3 = createRecord(wg);
        var record4 = createRecord(wg);
        wg.addRecord(record1);
        wg.addRecord(record2);
        wg.addRecord(record3);
        wg.addRecord(record4);

        wg.disableRecord(record2);
        wg.disableRecord(record3);

        expect(record2.disabled).toBeTruthy();

        expect(wg.headEnabledRecord).toBe(record1);
        expect(wg.tailEnabledRecord).toBe(record4);

        expect(record1.nextEnabled).toBe(record4);
        expect(record4.prevEnabled).toBe(record1);
      });

      it("should enable a record", () => {
        var wg = new WatchGroup(null, null);
        var record1 = createRecord(wg);
        var record2 = createRecord(wg);
        var record3 = createRecord(wg);
        var record4 = createRecord(wg);
        wg.addRecord(record1);
        wg.addRecord(record2);
        wg.addRecord(record3);
        wg.addRecord(record4);
        wg.disableRecord(record2);
        wg.disableRecord(record3);

        wg.enableRecord(record2);
        wg.enableRecord(record3);

        expect(record1.nextEnabled).toBe(record2);
        expect(record2.nextEnabled).toBe(record3);
        expect(record3.nextEnabled).toBe(record4);
        expect(record4.prevEnabled).toBe(record3);
      });
    })
  });
}