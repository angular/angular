import {ddescribe, describe, it, iit, xit, expect, beforeEach} from 'test_lib/test_lib';

import {List, ListWrapper, MapWrapper} from 'facade/collection';
import {isPresent} from 'facade/lang';
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
  function humanize(wg:WatchGroup, names:List) {
    var lookupName = (item) =>
      ListWrapper.last(
        ListWrapper.find(names, (pair) => pair[0] === item));

    var res = [];
    var record = wg.findFirstEnabledRecord();
    while (isPresent(record)) {
      ListWrapper.push(res, lookupName(record));
      record = record.nextEnabled;
    }
    return res;
  }

  function createRecord(wg) {
    return new Record(wg, new ProtoRecord(null, null, null, null, null), null);
  }

  describe('watch group', () => {
    it("should add records", () => {
      var wg = new WatchGroup(null, null);
      var record1 = createRecord(wg);
      var record2 = createRecord(wg);

      wg.addRecord(record1);
      wg.addRecord(record2);

      expect(humanize(wg, [
        [record1, 'record1'],
        [record2, 'record2']
      ])).toEqual(['record1', 'record2']);
    });

    describe("adding/removing child groups", () => {
      var parent, child1, child2;
      var childRecord1, childRecord2;
      var recordNames;

      beforeEach(() => {
        parent = new WatchGroup(null, null);

        child1 = new WatchGroup(null, null);
        childRecord1 = createRecord(child1);
        child1.addRecord(childRecord1);

        child2 = new WatchGroup(null, null);
        childRecord2 = createRecord(child2);
        child2.addRecord(childRecord2);

        recordNames = [
          [childRecord1, 'record1'],
          [childRecord2, 'record2'],
        ];
      });

      it("should add child groups", () => {
        parent.addChild(child1);
        parent.addChild(child2);

        expect(humanize(parent, recordNames)).toEqual(['record1', 'record2']);
      });

      it("should remove children", () => {
        parent.addChild(child1);
        parent.addChild(child2);

        parent.removeChild(child1);

        expect(humanize(parent, recordNames)).toEqual(['record2']);

        parent.removeChild(child2);

        expect(humanize(parent, recordNames)).toEqual([]);
      });
    });

    describe("enabling/disabling records", () => {
      var wg;
      var record1, record2, record3, record4;
      var recordNames;

      beforeEach(() => {
        wg = new WatchGroup(null, null);
        record1 = createRecord(wg);
        record2 = createRecord(wg);
        record3 = createRecord(wg);
        record4 = createRecord(wg);

        recordNames = [
          [record1, 'record1'],
          [record2, 'record2'],
          [record3, 'record3'],
          [record4, 'record4']
        ];
      });

      it("should disable a single record", () => {
        wg.addRecord(record1);

        wg.disableRecord(record1);

        expect(humanize(wg, recordNames)).toEqual([]);
      });

      it("should enable a single record", () => {
        wg.addRecord(record1);
        wg.disableRecord(record1);

        wg.enableRecord(record1);

        expect(humanize(wg, recordNames)).toEqual(['record1']);
      });

      it("should disable a record", () => {
        wg.addRecord(record1);
        wg.addRecord(record2);
        wg.addRecord(record3);
        wg.addRecord(record4);

        wg.disableRecord(record2);
        wg.disableRecord(record3);

        expect(record2.disabled).toBeTruthy();
        expect(record3.disabled).toBeTruthy();

        expect(humanize(wg, recordNames)).toEqual(['record1', 'record4']);
      });

      it("should enable a record", () => {
        wg.addRecord(record1);
        wg.addRecord(record2);
        wg.addRecord(record3);
        wg.addRecord(record4);
        wg.disableRecord(record2);
        wg.disableRecord(record3);

        wg.enableRecord(record2);
        wg.enableRecord(record3);

        expect(humanize(wg, recordNames)).toEqual(['record1', 'record2', 'record3', 'record4']);
      });
    });

    describe("enabling/disabling child groups", () => {
      var child1, child2, child3, child4;
      var record1, record2, record3, record4;
      var recordNames;

      beforeEach(() => {
        child1 = new WatchGroup(null, null);
        record1 = createRecord(child1);
        child1.addRecord(record1);

        child2 = new WatchGroup(null, null);
        record2 = createRecord(child2);
        child2.addRecord(record2);

        child3 = new WatchGroup(null, null);
        record3 = createRecord(child3);
        child3.addRecord(record3);

        child4 = new WatchGroup(null, null);
        record4 = createRecord(child4);
        child4.addRecord(record4);

        recordNames = [
          [record1, 'record1'],
          [record2, 'record2'],
          [record3, 'record3'],
          [record4, 'record4']
        ];
      });

      it("should disable a single watch group", () => {
        var parent = new WatchGroup(null, null);
        parent.addChild(child1);

        parent.disableGroup(child1);

        expect(humanize(parent, recordNames)).toEqual([]);
      });

      it("should enable a single watch group", () => {
        var parent = new WatchGroup(null, null);
        parent.addChild(child1);
        parent.disableGroup(child1);

        parent.enableGroup(child1);

        expect(humanize(parent, recordNames)).toEqual(['record1']);
      });

      it("should disable a watch group", () => {
        var parent = new WatchGroup(null, null);
        parent.addChild(child1);
        parent.addChild(child2);
        parent.addChild(child3);
        parent.addChild(child4);

        parent.disableGroup(child2);
        parent.disableGroup(child3);

        expect(humanize(parent, recordNames)).toEqual(['record1', 'record4']);
      });

      it("should enable a watch group", () => {
        var parent = new WatchGroup(null, null);
        parent.addChild(child1);
        parent.addChild(child2);
        parent.addChild(child3);
        parent.addChild(child4);
        parent.disableGroup(child2);
        parent.disableGroup(child3);

        parent.enableGroup(child2);
        parent.enableGroup(child3);

        expect(humanize(parent, recordNames)).toEqual([
          'record1', 'record2', 'record3', 'record4'
        ]);
      });
    });
  });
}