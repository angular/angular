var testing_internal_1 = require('angular2/testing_internal');
var path_recognizer_1 = require('angular2/src/router/path_recognizer');
var url_parser_1 = require('angular2/src/router/url_parser');
var sync_route_handler_1 = require('angular2/src/router/sync_route_handler');
var DummyClass = (function () {
    function DummyClass() {
    }
    return DummyClass;
})();
var mockRouteHandler = new sync_route_handler_1.SyncRouteHandler(DummyClass);
function main() {
    testing_internal_1.describe('PathRecognizer', function () {
        testing_internal_1.it('should throw when given an invalid path', function () {
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('/hi#', mockRouteHandler); })
                .toThrowError("Path \"/hi#\" should not include \"#\". Use \"HashLocationStrategy\" instead.");
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('hi?', mockRouteHandler); })
                .toThrowError("Path \"hi?\" contains \"?\" which is not allowed in a route config.");
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('hi;', mockRouteHandler); })
                .toThrowError("Path \"hi;\" contains \";\" which is not allowed in a route config.");
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('hi=', mockRouteHandler); })
                .toThrowError("Path \"hi=\" contains \"=\" which is not allowed in a route config.");
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('hi(', mockRouteHandler); })
                .toThrowError("Path \"hi(\" contains \"(\" which is not allowed in a route config.");
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('hi)', mockRouteHandler); })
                .toThrowError("Path \"hi)\" contains \")\" which is not allowed in a route config.");
            testing_internal_1.expect(function () { return new path_recognizer_1.PathRecognizer('hi//there', mockRouteHandler); })
                .toThrowError("Path \"hi//there\" contains \"//\" which is not allowed in a route config.");
        });
        testing_internal_1.it('should return the same instruction instance when recognizing the same path', function () {
            var rec = new path_recognizer_1.PathRecognizer('/one', mockRouteHandler);
            var one = new url_parser_1.Url('one', null, null, {});
            var firstMatch = rec.recognize(one);
            var secondMatch = rec.recognize(one);
            testing_internal_1.expect(firstMatch.instruction).toBe(secondMatch.instruction);
        });
        testing_internal_1.describe('querystring params', function () {
            testing_internal_1.it('should parse querystring params so long as the recognizer is a root', function () {
                var rec = new path_recognizer_1.PathRecognizer('/hello/there', mockRouteHandler);
                var url = url_parser_1.parser.parse('/hello/there?name=igor');
                var match = rec.recognize(url);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'name': 'igor' });
            });
            testing_internal_1.it('should return a combined map of parameters with the param expected in the URL path', function () {
                var rec = new path_recognizer_1.PathRecognizer('/hello/:name', mockRouteHandler);
                var url = url_parser_1.parser.parse('/hello/paul?topic=success');
                var match = rec.recognize(url);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'name': 'paul', 'topic': 'success' });
            });
        });
        testing_internal_1.describe('matrix params', function () {
            testing_internal_1.it('should be parsed along with dynamic paths', function () {
                var rec = new path_recognizer_1.PathRecognizer('/hello/:id', mockRouteHandler);
                var url = new url_parser_1.Url('hello', new url_parser_1.Url('matias', null, null, { 'key': 'value' }));
                var match = rec.recognize(url);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'id': 'matias', 'key': 'value' });
            });
            testing_internal_1.it('should be parsed on a static path', function () {
                var rec = new path_recognizer_1.PathRecognizer('/person', mockRouteHandler);
                var url = new url_parser_1.Url('person', null, null, { 'name': 'dave' });
                var match = rec.recognize(url);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'name': 'dave' });
            });
            testing_internal_1.it('should be ignored on a wildcard segment', function () {
                var rec = new path_recognizer_1.PathRecognizer('/wild/*everything', mockRouteHandler);
                var url = url_parser_1.parser.parse('/wild/super;variable=value');
                var match = rec.recognize(url);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'everything': 'super;variable=value' });
            });
            testing_internal_1.it('should set matrix param values to true when no value is present', function () {
                var rec = new path_recognizer_1.PathRecognizer('/path', mockRouteHandler);
                var url = new url_parser_1.Url('path', null, null, { 'one': true, 'two': true, 'three': '3' });
                var match = rec.recognize(url);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'one': true, 'two': true, 'three': '3' });
            });
            testing_internal_1.it('should be parsed on the final segment of the path', function () {
                var rec = new path_recognizer_1.PathRecognizer('/one/two/three', mockRouteHandler);
                var three = new url_parser_1.Url('three', null, null, { 'c': '3' });
                var two = new url_parser_1.Url('two', three, null, { 'b': '2' });
                var one = new url_parser_1.Url('one', two, null, { 'a': '1' });
                var match = rec.recognize(one);
                testing_internal_1.expect(match.instruction.params).toEqual({ 'c': '3' });
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=path_recognizer_spec.js.map