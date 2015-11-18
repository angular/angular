var testing_internal_1 = require('angular2/testing_internal');
var url_parser_1 = require('angular2/src/router/url_parser');
function main() {
    testing_internal_1.describe('ParsedUrl', function () {
        var urlParser;
        testing_internal_1.beforeEach(function () { urlParser = new url_parser_1.UrlParser(); });
        testing_internal_1.it('should work in a simple case', function () {
            var url = urlParser.parse('hello/there');
            testing_internal_1.expect(url.toString()).toEqual('hello/there');
        });
        testing_internal_1.it('should remove the leading slash', function () {
            var url = urlParser.parse('/hello/there');
            testing_internal_1.expect(url.toString()).toEqual('hello/there');
        });
        testing_internal_1.it('should parse an empty URL', function () {
            var url = urlParser.parse('');
            testing_internal_1.expect(url.toString()).toEqual('');
        });
        testing_internal_1.it('should work with a single aux route', function () {
            var url = urlParser.parse('hello/there(a)');
            testing_internal_1.expect(url.toString()).toEqual('hello/there(a)');
        });
        testing_internal_1.it('should work with multiple aux routes', function () {
            var url = urlParser.parse('hello/there(a//b)');
            testing_internal_1.expect(url.toString()).toEqual('hello/there(a//b)');
        });
        testing_internal_1.it('should work with children after an aux route', function () {
            var url = urlParser.parse('hello/there(a//b)/c/d');
            testing_internal_1.expect(url.toString()).toEqual('hello/there(a//b)/c/d');
        });
        testing_internal_1.it('should work when aux routes have children', function () {
            var url = urlParser.parse('hello(aa/bb//bb/cc)');
            testing_internal_1.expect(url.toString()).toEqual('hello(aa/bb//bb/cc)');
        });
        testing_internal_1.it('should parse an aux route with an aux route', function () {
            var url = urlParser.parse('hello(aa(bb))');
            testing_internal_1.expect(url.toString()).toEqual('hello(aa(bb))');
        });
        testing_internal_1.it('should simplify an empty aux route definition', function () {
            var url = urlParser.parse('hello()/there');
            testing_internal_1.expect(url.toString()).toEqual('hello/there');
        });
        testing_internal_1.it('should parse a key-value matrix param', function () {
            var url = urlParser.parse('hello/friend;name=bob');
            testing_internal_1.expect(url.toString()).toEqual('hello/friend;name=bob');
        });
        testing_internal_1.it('should parse multiple key-value matrix params', function () {
            var url = urlParser.parse('hello/there;greeting=hi;whats=up');
            testing_internal_1.expect(url.toString()).toEqual('hello/there;greeting=hi;whats=up');
        });
        testing_internal_1.it('should ignore matrix params on the first segment', function () {
            var url = urlParser.parse('profile;a=1/hi');
            testing_internal_1.expect(url.toString()).toEqual('profile/hi');
        });
        testing_internal_1.it('should parse a key-only matrix param', function () {
            var url = urlParser.parse('hello/there;hi');
            testing_internal_1.expect(url.toString()).toEqual('hello/there;hi');
        });
        testing_internal_1.it('should parse a URL with just a query param', function () {
            var url = urlParser.parse('?name=bob');
            testing_internal_1.expect(url.toString()).toEqual('?name=bob');
        });
        testing_internal_1.it('should parse a key-value query param', function () {
            var url = urlParser.parse('hello/friend?name=bob');
            testing_internal_1.expect(url.toString()).toEqual('hello/friend?name=bob');
        });
        testing_internal_1.it('should parse multiple key-value query params', function () {
            var url = urlParser.parse('hello/there?greeting=hi&whats=up');
            testing_internal_1.expect(url.params).toEqual({ 'greeting': 'hi', 'whats': 'up' });
            testing_internal_1.expect(url.toString()).toEqual('hello/there?greeting=hi&whats=up');
        });
        testing_internal_1.it('should parse a key-only query param', function () {
            var url = urlParser.parse('hello/there?hi');
            testing_internal_1.expect(url.toString()).toEqual('hello/there?hi');
        });
        testing_internal_1.it('should parse a route with matrix and query params', function () {
            var url = urlParser.parse('hello/there;sort=asc;unfiltered?hi&friend=true');
            testing_internal_1.expect(url.toString()).toEqual('hello/there;sort=asc;unfiltered?hi&friend=true');
        });
        testing_internal_1.it('should parse a route with matrix params and aux routes', function () {
            var url = urlParser.parse('hello/there;sort=asc(modal)');
            testing_internal_1.expect(url.toString()).toEqual('hello/there;sort=asc(modal)');
        });
        testing_internal_1.it('should parse an aux route with matrix params', function () {
            var url = urlParser.parse('hello/there(modal;sort=asc)');
            testing_internal_1.expect(url.toString()).toEqual('hello/there(modal;sort=asc)');
        });
        testing_internal_1.it('should parse a route with matrix params, aux routes, and query params', function () {
            var url = urlParser.parse('hello/there;sort=asc(modal)?friend=true');
            testing_internal_1.expect(url.toString()).toEqual('hello/there;sort=asc(modal)?friend=true');
        });
    });
}
exports.main = main;
//# sourceMappingURL=url_parser_spec.js.map