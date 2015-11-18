var di_1 = require('angular2/src/core/di');
var schema_registry_mock_1 = require('./schema_registry_mock');
var element_schema_registry_1 = require('angular2/src/compiler/schema/element_schema_registry');
var xhr_mock_1 = require('angular2/src/compiler/xhr_mock');
var xhr_1 = require('angular2/src/compiler/xhr');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
exports.TEST_PROVIDERS = [
    di_1.provide(element_schema_registry_1.ElementSchemaRegistry, { useValue: new schema_registry_mock_1.MockSchemaRegistry({}, {}) }),
    di_1.provide(xhr_1.XHR, { useClass: xhr_mock_1.MockXHR }),
    di_1.provide(url_resolver_1.UrlResolver, { useFactory: url_resolver_1.createWithoutPackagePrefix })
];
//# sourceMappingURL=test_bindings.js.map