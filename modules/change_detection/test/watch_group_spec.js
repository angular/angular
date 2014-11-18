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

    describe("adding children", () => {
      it("should add child watch group", () => {
        var parent = new WatchGroup(null, null);
        var child1 = new WatchGroup(null, null);
        var child2 = new WatchGroup(null, null);
        parent.addChild(child1);
        parent.addChild(child2);

        expect(parent.childHead).toBe(child1);
        expect(parent.childTail).toBe(child2);

        expect(child1.next).toBe(child2);
        expect(child2.prev).toBe(child1);
      });

      it("should link all records", () => {
        var parent = new WatchGroup(null, null);
        var parentRecord = createRecord(parent);
        parent.addRecord(parentRecord);

        var child = new WatchGroup(null, null);
        var childRecord = createRecord(child);
        child.addRecord(childRecord);

        parent.addChild(child);

        expect(parent.headRecord).toBe(parentRecord);
        expect(parent.tailRecord).toBe(childRecord);

        expect(parent.headEnabledRecord).toBe(parentRecord);
        expect(parent.tailEnabledRecord).toBe(childRecord);

        expect(parentRecord.next).toBe(childRecord);
        expect(childRecord.prev).toBe(parentRecord);
      });

      it("should work when parent has no records", () => {
        var parent = new WatchGroup(null, null);

        var child = new WatchGroup(null, null);
        var childRecord = createRecord(child);
        child.addRecord(childRecord);

        parent.addChild(child);

        expect(parent.headRecord).toBe(childRecord);
        expect(parent.tailRecord).toBe(childRecord);

        expect(parent.headEnabledRecord).toBe(childRecord);
        expect(parent.tailEnabledRecord).toBe(childRecord);
      });

      it("should work when parent has no records and first child has no records", () => {
        var parent = new WatchGroup(null, null);
        var firstChild = new WatchGroup(null, null);
        parent.addChild(firstChild);

        var child = new WatchGroup(null, null);
        var childRecord = createRecord(child);
        child.addRecord(childRecord);

        parent.addChild(child);

        expect(parent.headRecord).toBe(childRecord);
        expect(parent.tailRecord).toBe(childRecord);

        expect(parent.headEnabledRecord).toBe(childRecord);
        expect(parent.tailEnabledRecord).toBe(childRecord);
      });

      it("should work when second child has no records", () => {
        var parent = new WatchGroup(null, null);

        var firstChild = new WatchGroup(null, null);
        var childRecord = createRecord(firstChild);
        firstChild.addRecord(childRecord);
        parent.addChild(firstChild);

        var secondChild = new WatchGroup(null, null);
        parent.addChild(secondChild);

        expect(parent.childHead).toBe(firstChild);
        expect(parent.childTail).toBe(secondChild);
      });

      // todo: vsavkin: enable after refactoring addChild
      xit("should update head and tail of the parent when disabling the only record" +
        "of the child", () => {
        var parent = new WatchGroup(null, null);

        var child = new WatchGroup(null, null);
        var record = createRecord(child);
        child.addRecord(record);
        parent.addChild(child);

        child.disableRecord(record);

        expect(parent.headRecord).toBeNull();
        expect(parent.tailRecord).toBeNull();
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