var testing_internal_1 = require('angular2/testing_internal');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var query_list_1 = require('angular2/src/core/linker/query_list');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    testing_internal_1.describe('QueryList', function () {
        var queryList;
        var log;
        testing_internal_1.beforeEach(function () {
            queryList = new query_list_1.QueryList();
            log = '';
        });
        function logAppend(item) { log += (log.length == 0 ? '' : ', ') + item; }
        testing_internal_1.it('should support resetting and iterating over the new objects', function () {
            queryList.reset(['one']);
            queryList.reset(['two']);
            collection_1.iterateListLike(queryList, logAppend);
            testing_internal_1.expect(log).toEqual('two');
        });
        testing_internal_1.it('should support length', function () {
            queryList.reset(['one', 'two']);
            testing_internal_1.expect(queryList.length).toEqual(2);
        });
        testing_internal_1.it('should support map', function () {
            queryList.reset(['one', 'two']);
            testing_internal_1.expect(queryList.map(function (x) { return x; })).toEqual(['one', 'two']);
        });
        if (!lang_1.IS_DART) {
            testing_internal_1.it('should support filter', function () {
                queryList.reset(['one', 'two']);
                testing_internal_1.expect(queryList.filter(function (x) { return x == "one"; })).toEqual(['one']);
            });
            testing_internal_1.it('should support reduce', function () {
                queryList.reset(["one", "two"]);
                testing_internal_1.expect(queryList.reduce(function (a, x) { return a + x; }, "start:")).toEqual("start:onetwo");
            });
            testing_internal_1.it('should support toArray', function () {
                queryList.reset(["one", "two"]);
                testing_internal_1.expect(queryList.reduce(function (a, x) { return a + x; }, "start:")).toEqual("start:onetwo");
            });
            testing_internal_1.it('should support toArray', function () {
                queryList.reset(["one", "two"]);
                testing_internal_1.expect(queryList.toArray()).toEqual(["one", "two"]);
            });
        }
        testing_internal_1.it('should support toString', function () {
            queryList.reset(['one', 'two']);
            var listString = queryList.toString();
            testing_internal_1.expect(lang_1.StringWrapper.contains(listString, 'one')).toBeTruthy();
            testing_internal_1.expect(lang_1.StringWrapper.contains(listString, 'two')).toBeTruthy();
        });
        testing_internal_1.it('should support first and last', function () {
            queryList.reset(['one', 'two', 'three']);
            testing_internal_1.expect(queryList.first).toEqual('one');
            testing_internal_1.expect(queryList.last).toEqual('three');
        });
        if (dom_adapter_1.DOM.supportsDOMEvents()) {
            testing_internal_1.describe('simple observable interface', function () {
                testing_internal_1.it('should fire callbacks on change', testing_internal_1.fakeAsync(function () {
                    var fires = 0;
                    async_1.ObservableWrapper.subscribe(queryList.changes, function (_) { fires += 1; });
                    queryList.notifyOnChanges();
                    testing_internal_1.tick();
                    testing_internal_1.expect(fires).toEqual(1);
                    queryList.notifyOnChanges();
                    testing_internal_1.tick();
                    testing_internal_1.expect(fires).toEqual(2);
                }));
                testing_internal_1.it('should provides query list as an argument', testing_internal_1.fakeAsync(function () {
                    var recorded;
                    async_1.ObservableWrapper.subscribe(queryList.changes, function (v) { recorded = v; });
                    queryList.reset(["one"]);
                    queryList.notifyOnChanges();
                    testing_internal_1.tick();
                    testing_internal_1.expect(recorded).toBe(queryList);
                }));
            });
        }
    });
}
exports.main = main;
//# sourceMappingURL=query_list_spec.js.map