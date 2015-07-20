library angular2.test.directives.observable_list_iterable_diff_spec;

import 'package:angular2/test_lib.dart';
import 'package:observe/observe.dart' show ObservableList;
import 'package:angular2/src/directives/observable_list_diff.dart';

String iterableChangesAsString({List additions: const [], List moves: const [], List removals: const []}) {
  return "additions: " + additions.join(', ') + " " + "moves: " + moves.join(', ') + " " +
  "removals: " + removals.join(', ');
}


main() {
  describe('ObservableListDiff', () {
    var pipeFactory, changeDetectorRef;

    beforeEach(() {
      pipeFactory = const ObservableListDiffFactory();
      changeDetectorRef = new SpyChangeDetectorRef();
    });

    describe("supports", () {
      it("should be true for ObservableList", () {
        expect(pipeFactory.supports(new ObservableList())).toBe(true);
      });

      it("should be false otherwise", () {
        expect(pipeFactory.supports([1,2,3])).toBe(false);
      });
    });

    it("should return same diff when no changes between the calls", () {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c = new ObservableList.from([1,2]);

      var diff = pipe.transform(c, []);

      expect(pipe.transform(c, [])).toBe(diff);
    });

    it("should return a new diff once a change has been triggered", fakeAsync(() {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c = new ObservableList.from([1,2]);

      final diff = pipe.transform(c, []);

      c.add(3);

      // same value, because we have not detected the change yet
      expect(pipe.transform(c, [])).toBe(diff);

      // now we detect the change
      flushMicrotasks();
      expect(pipe.transform(c, [])).not.toBe(pipe);
    }));

    it("should request a change detection check upon receiving a change", fakeAsync(() {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c = new ObservableList.from([1,2]);
      pipe.transform(c, []);

      c.add(3);
      flushMicrotasks();

      expect(changeDetectorRef.spy("requestCheck")).toHaveBeenCalledOnce();
    }));

    it("should return a new diff after changing a collection", () {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c1 = new ObservableList.from([1,2]);
      final c2 = new ObservableList.from([3,4]);

      final diff = pipe.transform(c1, []);
      expect(pipe.transform(c2, [])).not.toBe(diff);
    });

    it("should not unbsubscribe from the stream of chagnes after changing a collection", () {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c1 = new ObservableList.from([1,2]);
      final diff = pipe.transform(c1, []);

      final c2 = new ObservableList.from([3,4]);
      final diff2 = pipe.transform(c2, []);
      expect(diff2).not.toBe(diff);

      // pushing into the first collection has no effect, and we do not see the change
      c1.add(3);
      expect(pipe.transform(c2, [])).toBe(diff2);
    });

    ddescribe("transforming ObservableList changes to Angular changes", () {
      var pipe;

      beforeEach(() {
        pipe = pipeFactory.create(changeDetectorRef);
      });

      it("should handle setting a list", fakeAsync(() {
        final list = new ObservableList.from([1,2]);
        final diff = pipe.transform(list);

        expect(diff.toString()).toEqual(iterableChangesAsString(
          additions: ['1[null->0], 2[null->1]']
        ));
      }));

      it("should support changing the reference", fakeAsync(() {
        pipe.transform(new ObservableList.from([0]));

        var diff = pipe.transform(new ObservableList.from([1,0]));
        expect(diff.toString()).toEqual(iterableChangesAsString(
          additions: ['1[null->0]']
        ));

        diff = pipe.transform(new ObservableList.from([2,1,0]));
        expect(diff.toString()).toEqual(iterableChangesAsString(
            additions: ['2[null->0]']
        ));
      }));

      iit("should support swapping an element", fakeAsync(() {
        final list = new ObservableList.from([1,2]);
        pipe.transform(list);

        print(list);
        list.clear();
        list.add(2);
        list.add(1);

        // [#<ListChangeRecord index: 0, removed: [], addedCount: 1>, #<ListChangeRecord index: 2, removed: [2], addedCount: 0>] Broken
        flushMicrotasks();

        var diff = pipe.transform(list);
        expect(diff.toString()).toEqual(iterableChangesAsString(
          additions: ['2[null->0]'],
//          moves: ['1[0->1]'],
          removals: ['2[1->null]']
        ));
      }));

      it("should handle adding to a list", fakeAsync(() {
        final list = new ObservableList.from([10,20]);
        pipe.transform(list);

        list.add(30);
        list.add(40);
        flushMicrotasks();

        final diff = pipe.transform(list);
        expect(diff.toString()).toEqual(iterableChangesAsString(
          additions: ['30[null->2], 40[null->3]']
        ));
      }));

      it("should handle removing from a list", fakeAsync(() {
        final list = new ObservableList.from([10,20,30]);
        pipe.transform(list);

        list.removeAt(2);
        list.removeAt(0);
        flushMicrotasks();

        final diff = pipe.transform(list);
        expect(diff.toString()).toEqual(iterableChangesAsString(
          removals: ['10[0->null]','30[2->null]']
        ));
      }));

      xit("should support adding and removing from a list", fakeAsync(() {
        final list = new ObservableList.from([10,20,30]);
        pipe.transform(list);

        list.removeAt(0);
        list.add(40);
        flushMicrotasks();

        final diff = pipe.transform(list);
        expect(diff.toString()).toEqual(iterableChangesAsString(
          additions: ['40[null->2]'],
          removals: ['20[1->null]']
        ));
      }));
    });
  });
}