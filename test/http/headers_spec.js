var headers_1 = require('angular2/src/http/headers');
var collection_1 = require('angular2/src/facade/collection');
var testing_internal_1 = require('angular2/testing_internal');
function main() {
    testing_internal_1.describe('Headers', function () {
        testing_internal_1.it('should conform to spec', function () {
            // Examples borrowed from https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers
            // Spec at https://fetch.spec.whatwg.org/#dom-headers
            var firstHeaders = new headers_1.Headers(); // Currently empty
            firstHeaders.append('Content-Type', 'image/jpeg');
            testing_internal_1.expect(firstHeaders.get('Content-Type')).toBe('image/jpeg');
            var httpHeaders = collection_1.StringMapWrapper.create();
            collection_1.StringMapWrapper.set(httpHeaders, 'Content-Type', 'image/jpeg');
            collection_1.StringMapWrapper.set(httpHeaders, 'Accept-Charset', 'utf-8');
            collection_1.StringMapWrapper.set(httpHeaders, 'X-My-Custom-Header', 'Zeke are cool');
            var secondHeaders = new headers_1.Headers(httpHeaders);
            var secondHeadersObj = new headers_1.Headers(secondHeaders);
            testing_internal_1.expect(secondHeadersObj.get('Content-Type')).toBe('image/jpeg');
        });
        testing_internal_1.describe('initialization', function () {
            testing_internal_1.it('should merge values in provided dictionary', function () {
                var map = collection_1.StringMapWrapper.create();
                collection_1.StringMapWrapper.set(map, 'foo', 'bar');
                var headers = new headers_1.Headers(map);
                testing_internal_1.expect(headers.get('foo')).toBe('bar');
                testing_internal_1.expect(headers.getAll('foo')).toEqual(['bar']);
            });
        });
        testing_internal_1.describe('.set()', function () {
            testing_internal_1.it('should clear all values and re-set for the provided key', function () {
                var map = collection_1.StringMapWrapper.create();
                collection_1.StringMapWrapper.set(map, 'foo', 'bar');
                var headers = new headers_1.Headers(map);
                testing_internal_1.expect(headers.get('foo')).toBe('bar');
                testing_internal_1.expect(headers.getAll('foo')).toEqual(['bar']);
                headers.set('foo', 'baz');
                testing_internal_1.expect(headers.get('foo')).toBe('baz');
                testing_internal_1.expect(headers.getAll('foo')).toEqual(['baz']);
            });
            testing_internal_1.it('should convert input array to string', function () {
                var headers = new headers_1.Headers();
                var inputArr = ['bar', 'baz'];
                headers.set('foo', inputArr);
                testing_internal_1.expect(/bar, ?baz/g.test(headers.get('foo'))).toBe(true);
                testing_internal_1.expect(/bar, ?baz/g.test(headers.getAll('foo')[0])).toBe(true);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=headers_spec.js.map