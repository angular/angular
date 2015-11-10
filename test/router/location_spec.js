var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var location_1 = require('angular2/src/router/location');
var location_strategy_1 = require('angular2/src/router/location_strategy');
var mock_location_strategy_1 = require('angular2/src/mock/mock_location_strategy');
function main() {
    testing_internal_1.describe('Location', function () {
        var locationStrategy, location;
        function makeLocation(baseHref, provider) {
            if (baseHref === void 0) { baseHref = '/my/app'; }
            if (provider === void 0) { provider = lang_1.CONST_EXPR([]); }
            locationStrategy = new mock_location_strategy_1.MockLocationStrategy();
            locationStrategy.internalBaseHref = baseHref;
            var injector = core_1.Injector.resolveAndCreate([location_1.Location, core_1.provide(location_strategy_1.LocationStrategy, { useValue: locationStrategy }), provider]);
            return location = injector.get(location_1.Location);
        }
        testing_internal_1.beforeEach(makeLocation);
        testing_internal_1.it('should not prepend urls with starting slash when an empty URL is provided', function () { testing_internal_1.expect(location.prepareExternalUrl('')).toEqual(locationStrategy.getBaseHref()); });
        testing_internal_1.it('should not prepend path with an extra slash when a baseHref has a trailing slash', function () {
            var location = makeLocation('/my/slashed/app/');
            testing_internal_1.expect(location.prepareExternalUrl('/page')).toEqual('/my/slashed/app/page');
        });
        testing_internal_1.it('should not append urls with leading slash on navigate', function () {
            location.go('/my/app/user/btford');
            testing_internal_1.expect(locationStrategy.path()).toEqual('/my/app/user/btford');
        });
        testing_internal_1.it('should normalize urls on popstate', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            locationStrategy.simulatePopState('/my/app/user/btford');
            location.subscribe(function (ev) {
                testing_internal_1.expect(ev['url']).toEqual('/user/btford');
                async.done();
            });
        }));
        testing_internal_1.it('should throw when no base href is provided', function () {
            var locationStrategy = new mock_location_strategy_1.MockLocationStrategy();
            locationStrategy.internalBaseHref = null;
            testing_internal_1.expect(function () { return new location_1.Location(locationStrategy); })
                .toThrowError("No base href set. Either provide a provider for the APP_BASE_HREF token or add a base element to the document.");
        });
        testing_internal_1.it('should revert to the previous path when a back() operation is executed', function () {
            var locationStrategy = new mock_location_strategy_1.MockLocationStrategy();
            var location = new location_1.Location(locationStrategy);
            function assertUrl(path) { testing_internal_1.expect(location.path()).toEqual(path); }
            location.go('/ready');
            assertUrl('/ready');
            location.go('/ready/set');
            assertUrl('/ready/set');
            location.go('/ready/set/go');
            assertUrl('/ready/set/go');
            location.back();
            assertUrl('/ready/set');
            location.back();
            assertUrl('/ready');
        });
        testing_internal_1.it('should incorporate the provided query values into the location change', function () {
            var locationStrategy = new mock_location_strategy_1.MockLocationStrategy();
            var location = new location_1.Location(locationStrategy);
            location.go('/home', "key=value");
            testing_internal_1.expect(location.path()).toEqual("/home?key=value");
        });
    });
}
exports.main = main;
//# sourceMappingURL=location_spec.js.map