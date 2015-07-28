library angular2.test.directives.observable_list_iterable_diff_spec;

import 'package:angular2/test_lib.dart';
import 'package:observe/observe.dart' show ObservableList;
import 'package:angular2/src/directives/observable_list_diff.dart';

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
        expect(pipeFactory.supports([1, 2, 3])).toBe(false);
      });
    });

    it("should return the wrapped value to trigger change detection on first invocation of transform",
        () {
      final pipe = pipeFactory.create(changeDetectorRef);
      final c = new ObservableList.from([1, 2]);
      expect(pipe.transform(c, []).wrapped).toBe(pipe);
    });

    it("should return itself when no changes between the calls", () {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c = new ObservableList.from([1, 2]);

      pipe.transform(c, []);

      expect(pipe.transform(c, [])).toBe(pipe);
    });

    it("should return the wrapped value once a change has been trigger",
        fakeAsync(() {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c = new ObservableList.from([1, 2]);

      pipe.transform(c, []);

      c.add(3);

      // same value, because we have not detected the change yet
      expect(pipe.transform(c, [])).toBe(pipe);

      // now we detect the change
      flushMicrotasks();
      expect(pipe.transform(c, []).wrapped).toBe(pipe);
    }));

    it("should request a change detection check upon receiving a change",
        fakeAsync(() {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c = new ObservableList.from([1, 2]);
      pipe.transform(c, []);

      c.add(3);
      flushMicrotasks();

      expect(changeDetectorRef.spy("requestCheck")).toHaveBeenCalledOnce();
    }));

    it("should return the wrapped value after changing a collection", () {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c1 = new ObservableList.from([1, 2]);
      final c2 = new ObservableList.from([3, 4]);

      expect(pipe.transform(c1, []).wrapped).toBe(pipe);
      expect(pipe.transform(c2, []).wrapped).toBe(pipe);
    });

    it("should not unbsubscribe from the stream of chagnes after changing a collection",
        () {
      final pipe = pipeFactory.create(changeDetectorRef);

      final c1 = new ObservableList.from([1, 2]);
      expect(pipe.transform(c1, []).wrapped).toBe(pipe);

      final c2 = new ObservableList.from([3, 4]);
      expect(pipe.transform(c2, []).wrapped).toBe(pipe);

      // pushing into the first collection has no effect, and we do not see the change
      c1.add(3);
      expect(pipe.transform(c2, [])).toBe(pipe);
    });
  });
}
