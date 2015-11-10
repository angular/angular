var testing_internal_1 = require('angular2/testing_internal');
var route_recognizer_1 = require('angular2/src/router/route_recognizer');
var route_config_decorator_1 = require('angular2/src/router/route_config_decorator');
var url_parser_1 = require('angular2/src/router/url_parser');
function main() {
    testing_internal_1.describe('RouteRecognizer', function () {
        var recognizer;
        testing_internal_1.beforeEach(function () { recognizer = new route_recognizer_1.RouteRecognizer(); });
        testing_internal_1.it('should recognize a static segment', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/test', component: DummyCmpA }));
            var solution = recognize(recognizer, '/test');
            testing_internal_1.expect(getComponentType(solution)).toEqual(DummyCmpA);
        });
        testing_internal_1.it('should recognize a single slash', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/', component: DummyCmpA }));
            var solution = recognize(recognizer, '/');
            testing_internal_1.expect(getComponentType(solution)).toEqual(DummyCmpA);
        });
        testing_internal_1.it('should recognize a dynamic segment', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/user/:name', component: DummyCmpA }));
            var solution = recognize(recognizer, '/user/brian');
            testing_internal_1.expect(getComponentType(solution)).toEqual(DummyCmpA);
            testing_internal_1.expect(solution.params).toEqual({ 'name': 'brian' });
        });
        testing_internal_1.it('should recognize a star segment', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/first/*rest', component: DummyCmpA }));
            var solution = recognize(recognizer, '/first/second/third');
            testing_internal_1.expect(getComponentType(solution)).toEqual(DummyCmpA);
            testing_internal_1.expect(solution.params).toEqual({ 'rest': 'second/third' });
        });
        testing_internal_1.it('should throw when given two routes that start with the same static segment', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/hello', component: DummyCmpA }));
            testing_internal_1.expect(function () { return recognizer.config(new route_config_decorator_1.Route({ path: '/hello', component: DummyCmpB })); })
                .toThrowError('Configuration \'/hello\' conflicts with existing route \'/hello\'');
        });
        testing_internal_1.it('should throw when given two routes that have dynamic segments in the same order', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/hello/:person/how/:doyoudou', component: DummyCmpA }));
            testing_internal_1.expect(function () { return recognizer.config(new route_config_decorator_1.Route({ path: '/hello/:friend/how/:areyou', component: DummyCmpA })); })
                .toThrowError('Configuration \'/hello/:friend/how/:areyou\' conflicts with existing route \'/hello/:person/how/:doyoudou\'');
        });
        testing_internal_1.it('should recognize redirects', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/b', component: DummyCmpA }));
            recognizer.config(new route_config_decorator_1.Redirect({ path: '/a', redirectTo: 'b' }));
            var solution = recognize(recognizer, '/a');
            testing_internal_1.expect(getComponentType(solution)).toEqual(DummyCmpA);
            testing_internal_1.expect(solution.urlPath).toEqual('b');
        });
        testing_internal_1.it('should not perform root URL redirect on a non-root route', function () {
            recognizer.config(new route_config_decorator_1.Redirect({ path: '/', redirectTo: '/foo' }));
            recognizer.config(new route_config_decorator_1.Route({ path: '/bar', component: DummyCmpA }));
            var solution = recognize(recognizer, '/bar');
            testing_internal_1.expect(solution.componentType).toEqual(DummyCmpA);
            testing_internal_1.expect(solution.urlPath).toEqual('bar');
        });
        testing_internal_1.it('should perform a root URL redirect only for root routes', function () {
            recognizer.config(new route_config_decorator_1.Redirect({ path: '/', redirectTo: '/matias' }));
            recognizer.config(new route_config_decorator_1.Route({ path: '/matias', component: DummyCmpA }));
            recognizer.config(new route_config_decorator_1.Route({ path: '/fatias', component: DummyCmpA }));
            var solution;
            solution = recognize(recognizer, '/');
            testing_internal_1.expect(solution.urlPath).toEqual('matias');
            solution = recognize(recognizer, '/fatias');
            testing_internal_1.expect(solution.urlPath).toEqual('fatias');
            solution = recognize(recognizer, '');
            testing_internal_1.expect(solution.urlPath).toEqual('matias');
        });
        testing_internal_1.it('should generate URLs with params', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/app/user/:name', component: DummyCmpA, name: 'User' }));
            var instruction = recognizer.generate('User', { 'name': 'misko' });
            testing_internal_1.expect(instruction.urlPath).toEqual('app/user/misko');
        });
        testing_internal_1.it('should generate URLs with numeric params', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: '/app/page/:number', component: DummyCmpA, name: 'Page' }));
            testing_internal_1.expect(recognizer.generate('Page', { 'number': 42 }).urlPath).toEqual('app/page/42');
        });
        testing_internal_1.it('should throw in the absence of required params URLs', function () {
            recognizer.config(new route_config_decorator_1.Route({ path: 'app/user/:name', component: DummyCmpA, name: 'User' }));
            testing_internal_1.expect(function () { return recognizer.generate('User', {}); })
                .toThrowError('Route generator for \'name\' was not included in parameters passed.');
        });
        testing_internal_1.it('should throw if the route alias is not CamelCase', function () {
            testing_internal_1.expect(function () { return recognizer.config(new route_config_decorator_1.Route({ path: 'app/user/:name', component: DummyCmpA, name: 'user' })); })
                .toThrowError("Route \"app/user/:name\" with name \"user\" does not begin with an uppercase letter. Route names should be CamelCase like \"User\".");
        });
        testing_internal_1.describe('params', function () {
            testing_internal_1.it('should recognize parameters within the URL path', function () {
                recognizer.config(new route_config_decorator_1.Route({ path: 'profile/:name', component: DummyCmpA, name: 'User' }));
                var solution = recognize(recognizer, '/profile/matsko?comments=all');
                testing_internal_1.expect(solution.params).toEqual({ 'name': 'matsko', 'comments': 'all' });
            });
            testing_internal_1.it('should generate and populate the given static-based route with querystring params', function () {
                recognizer.config(new route_config_decorator_1.Route({ path: 'forum/featured', component: DummyCmpA, name: 'ForumPage' }));
                var params = { 'start': 10, 'end': 100 };
                var result = recognizer.generate('ForumPage', params);
                testing_internal_1.expect(result.urlPath).toEqual('forum/featured');
                testing_internal_1.expect(result.urlParams).toEqual(['start=10', 'end=100']);
            });
            testing_internal_1.it('should prefer positional params over query params', function () {
                recognizer.config(new route_config_decorator_1.Route({ path: 'profile/:name', component: DummyCmpA, name: 'User' }));
                var solution = recognize(recognizer, '/profile/yegor?name=igor');
                testing_internal_1.expect(solution.params).toEqual({ 'name': 'yegor' });
            });
            testing_internal_1.it('should ignore matrix params for the top-level component', function () {
                recognizer.config(new route_config_decorator_1.Route({ path: '/home/:subject', component: DummyCmpA, name: 'User' }));
                var solution = recognize(recognizer, '/home;sort=asc/zero;one=1?two=2');
                testing_internal_1.expect(solution.params).toEqual({ 'subject': 'zero', 'two': '2' });
            });
        });
    });
}
exports.main = main;
function recognize(recognizer, url) {
    return recognizer.recognize(url_parser_1.parser.parse(url))[0].instruction;
}
function getComponentType(routeMatch) {
    return routeMatch.componentType;
}
var DummyCmpA = (function () {
    function DummyCmpA() {
    }
    return DummyCmpA;
})();
var DummyCmpB = (function () {
    function DummyCmpB() {
    }
    return DummyCmpB;
})();
//# sourceMappingURL=route_recognizer_spec.js.map