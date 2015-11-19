library angular2.test.core.linker.query_list_spec;

import "package:angular2/testing_internal.dart"
    show
        describe,
        it,
        expect,
        beforeEach,
        ddescribe,
        iit,
        xit,
        el,
        fakeAsync,
        tick;
import "package:angular2/src/facade/collection.dart"
    show MapWrapper, ListWrapper, iterateListLike;
import "package:angular2/src/facade/lang.dart" show IS_DART, StringWrapper;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;
import "package:angular2/src/core/linker/query_list.dart" show QueryList;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;

abstract class _JsQueryList {
  dynamic filter(dynamic c);
  dynamic reduce(dynamic a, dynamic b);
  dynamic toArray();
}

main() {
  describe("QueryList", () {
    QueryList<String> queryList;
    String log;
    beforeEach(() {
      queryList = new QueryList<String>();
      log = "";
    });
    logAppend(item) {
      log += (log.length == 0 ? "" : ", ") + item;
    }
    it("should support resetting and iterating over the new objects", () {
      queryList.reset(["one"]);
      queryList.reset(["two"]);
      iterateListLike(queryList, logAppend);
      expect(log).toEqual("two");
    });
    it("should support length", () {
      queryList.reset(["one", "two"]);
      expect(queryList.length).toEqual(2);
    });
    it("should support map", () {
      queryList.reset(["one", "two"]);
      expect(queryList.map((x) => x)).toEqual(["one", "two"]);
    });
    if (!IS_DART) {
      it("should support filter", () {
        queryList.reset(["one", "two"]);
        expect(((queryList as _JsQueryList)).filter((x) => x == "one"))
            .toEqual(["one"]);
      });
      it("should support reduce", () {
        queryList.reset(["one", "two"]);
        expect(((queryList as _JsQueryList)).reduce((a, x) => a + x, "start:"))
            .toEqual("start:onetwo");
      });
      it("should support toArray", () {
        queryList.reset(["one", "two"]);
        expect(((queryList as _JsQueryList)).reduce((a, x) => a + x, "start:"))
            .toEqual("start:onetwo");
      });
      it("should support toArray", () {
        queryList.reset(["one", "two"]);
        expect(((queryList as _JsQueryList)).toArray()).toEqual(["one", "two"]);
      });
    }
    it("should support toString", () {
      queryList.reset(["one", "two"]);
      var listString = queryList.toString();
      expect(StringWrapper.contains(listString, "one")).toBeTruthy();
      expect(StringWrapper.contains(listString, "two")).toBeTruthy();
    });
    it("should support first and last", () {
      queryList.reset(["one", "two", "three"]);
      expect(queryList.first).toEqual("one");
      expect(queryList.last).toEqual("three");
    });
    if (DOM.supportsDOMEvents()) {
      describe("simple observable interface", () {
        it("should fire callbacks on change", fakeAsync(() {
          var fires = 0;
          ObservableWrapper.subscribe(queryList.changes, (_) {
            fires += 1;
          });
          queryList.notifyOnChanges();
          tick();
          expect(fires).toEqual(1);
          queryList.notifyOnChanges();
          tick();
          expect(fires).toEqual(2);
        }));
        it("should provides query list as an argument", fakeAsync(() {
          var recorded;
          ObservableWrapper.subscribe(queryList.changes, (dynamic v) {
            recorded = v;
          });
          queryList.reset(["one"]);
          queryList.notifyOnChanges();
          tick();
          expect(recorded).toBe(queryList);
        }));
      });
    }
  });
}
