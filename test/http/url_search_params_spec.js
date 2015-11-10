var testing_internal_1 = require('angular2/testing_internal');
var url_search_params_1 = require('angular2/src/http/url_search_params');
function main() {
    testing_internal_1.describe('URLSearchParams', function () {
        testing_internal_1.it('should conform to spec', function () {
            var paramsString = "q=URLUtils.searchParams&topic=api";
            var searchParams = new url_search_params_1.URLSearchParams(paramsString);
            // Tests borrowed from example at
            // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
            // Compliant with spec described at https://url.spec.whatwg.org/#urlsearchparams
            testing_internal_1.expect(searchParams.has("topic")).toBe(true);
            testing_internal_1.expect(searchParams.has("foo")).toBe(false);
            testing_internal_1.expect(searchParams.get("topic")).toEqual("api");
            testing_internal_1.expect(searchParams.getAll("topic")).toEqual(["api"]);
            testing_internal_1.expect(searchParams.get("foo")).toBe(null);
            searchParams.append("topic", "webdev");
            testing_internal_1.expect(searchParams.getAll("topic")).toEqual(["api", "webdev"]);
            testing_internal_1.expect(searchParams.toString()).toEqual("q=URLUtils.searchParams&topic=api&topic=webdev");
            searchParams.delete("topic");
            testing_internal_1.expect(searchParams.toString()).toEqual("q=URLUtils.searchParams");
            // Test default constructor
            testing_internal_1.expect(new url_search_params_1.URLSearchParams().toString()).toBe("");
        });
        testing_internal_1.it('should support map-like merging operation via setAll()', function () {
            var mapA = new url_search_params_1.URLSearchParams('a=1&a=2&a=3&c=8');
            var mapB = new url_search_params_1.URLSearchParams('a=4&a=5&a=6&b=7');
            mapA.setAll(mapB);
            testing_internal_1.expect(mapA.has('a')).toBe(true);
            testing_internal_1.expect(mapA.has('b')).toBe(true);
            testing_internal_1.expect(mapA.has('c')).toBe(true);
            testing_internal_1.expect(mapA.getAll('a')).toEqual(['4']);
            testing_internal_1.expect(mapA.getAll('b')).toEqual(['7']);
            testing_internal_1.expect(mapA.getAll('c')).toEqual(['8']);
            testing_internal_1.expect(mapA.toString()).toEqual('a=4&c=8&b=7');
        });
        testing_internal_1.it('should support multimap-like merging operation via appendAll()', function () {
            var mapA = new url_search_params_1.URLSearchParams('a=1&a=2&a=3&c=8');
            var mapB = new url_search_params_1.URLSearchParams('a=4&a=5&a=6&b=7');
            mapA.appendAll(mapB);
            testing_internal_1.expect(mapA.has('a')).toBe(true);
            testing_internal_1.expect(mapA.has('b')).toBe(true);
            testing_internal_1.expect(mapA.has('c')).toBe(true);
            testing_internal_1.expect(mapA.getAll('a')).toEqual(['1', '2', '3', '4', '5', '6']);
            testing_internal_1.expect(mapA.getAll('b')).toEqual(['7']);
            testing_internal_1.expect(mapA.getAll('c')).toEqual(['8']);
            testing_internal_1.expect(mapA.toString()).toEqual('a=1&a=2&a=3&a=4&a=5&a=6&c=8&b=7');
        });
        testing_internal_1.it('should support multimap-like merging operation via replaceAll()', function () {
            var mapA = new url_search_params_1.URLSearchParams('a=1&a=2&a=3&c=8');
            var mapB = new url_search_params_1.URLSearchParams('a=4&a=5&a=6&b=7');
            mapA.replaceAll(mapB);
            testing_internal_1.expect(mapA.has('a')).toBe(true);
            testing_internal_1.expect(mapA.has('b')).toBe(true);
            testing_internal_1.expect(mapA.has('c')).toBe(true);
            testing_internal_1.expect(mapA.getAll('a')).toEqual(['4', '5', '6']);
            testing_internal_1.expect(mapA.getAll('b')).toEqual(['7']);
            testing_internal_1.expect(mapA.getAll('c')).toEqual(['8']);
            testing_internal_1.expect(mapA.toString()).toEqual('a=4&a=5&a=6&c=8&b=7');
        });
    });
}
exports.main = main;
//# sourceMappingURL=url_search_params_spec.js.map