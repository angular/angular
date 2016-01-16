import {
  describe,
  it,
  expect,
  beforeEach,
  ddescribe,
  iit,
  xit,
  el,
  fakeAsync,
  tick
} from 'angular2/testing_internal';
import {MapWrapper, ListWrapper, iterateListLike} from 'angular2/src/facade/collection';
import {IS_DART, StringWrapper} from 'angular2/src/facade/lang';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {QueryList} from 'angular2/src/core/linker/query_list';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

interface _JsQueryList {
  filter(c: any): any;
  reduce(a: any, b: any): any;
  toArray(): any;
}

export function main() {
  describe('QueryList', () => {
    var queryList: QueryList<string>;
    var log: string;
    beforeEach(() => {
      queryList = new QueryList<string>();
      log = '';
    });

    function logAppend(item) { log += (log.length == 0 ? '' : ', ') + item; }

    it('should support resetting and iterating over the new objects', () => {
      queryList.reset(['one']);
      queryList.reset(['two']);
      iterateListLike(queryList, logAppend);
      expect(log).toEqual('two');
    });

    it('should support length', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.length).toEqual(2);
    });

    it('should support map', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.map((x) => x)).toEqual(['one', 'two']);
    });

    if (!IS_DART) {
      it('should support filter', () => {
        queryList.reset(['one', 'two']);
        expect((<_JsQueryList>queryList).filter((x) => x == "one")).toEqual(['one']);
      });

      it('should support reduce', () => {
        queryList.reset(["one", "two"]);
        expect((<_JsQueryList>queryList).reduce((a, x) => a + x, "start:")).toEqual("start:onetwo");
      });

      it('should support toArray', () => {
        queryList.reset(["one", "two"]);
        expect((<_JsQueryList>queryList).reduce((a, x) => a + x, "start:")).toEqual("start:onetwo");
      });

      it('should support toArray', () => {
        queryList.reset(["one", "two"]);
        expect((<_JsQueryList>queryList).toArray()).toEqual(["one", "two"]);
      });
    }

    it('should support toString', () => {
      queryList.reset(['one', 'two']);
      var listString = queryList.toString();
      expect(StringWrapper.contains(listString, 'one')).toBeTruthy();
      expect(StringWrapper.contains(listString, 'two')).toBeTruthy();
    });

    it('should support first and last', () => {
      queryList.reset(['one', 'two', 'three']);
      expect(queryList.first).toEqual('one');
      expect(queryList.last).toEqual('three');
    });

    if (DOM.supportsDOMEvents()) {
      describe('simple observable interface', () => {
        it('should fire callbacks on change', fakeAsync(() => {
             var fires = 0;
             ObservableWrapper.subscribe(queryList.changes, (_) => { fires += 1; });

             queryList.notifyOnChanges();
             tick();

             expect(fires).toEqual(1);

             queryList.notifyOnChanges();
             tick();

             expect(fires).toEqual(2);
           }));

        it('should provides query list as an argument', fakeAsync(() => {
             var recorded;
             ObservableWrapper.subscribe(queryList.changes, (v: any) => { recorded = v; });

             queryList.reset(["one"]);
             queryList.notifyOnChanges();
             tick();

             expect(recorded).toBe(queryList);
           }));
      });
    }
  });
}
