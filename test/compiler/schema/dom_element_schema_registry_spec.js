var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var dom_element_schema_registry_1 = require('angular2/src/compiler/schema/dom_element_schema_registry');
function main() {
    // DOMElementSchema can only be used on the JS side where we can safely
    // use reflection for DOM elements
    if (lang_1.IS_DART)
        return;
    var registry;
    testing_internal_1.beforeEach(function () { registry = new dom_element_schema_registry_1.DomElementSchemaRegistry(); });
    testing_internal_1.describe('DOMElementSchema', function () {
        testing_internal_1.it('should detect properties on regular elements', function () {
            testing_internal_1.expect(registry.hasProperty('div', 'id')).toBeTruthy();
            testing_internal_1.expect(registry.hasProperty('div', 'title')).toBeTruthy();
            testing_internal_1.expect(registry.hasProperty('div', 'unknown')).toBeFalsy();
        });
        testing_internal_1.it('should return true for custom-like elements', function () { testing_internal_1.expect(registry.hasProperty('custom-like', 'unknown')).toBeTruthy(); });
        testing_internal_1.it('should not re-map property names that are not specified in DOM facade', function () { testing_internal_1.expect(registry.getMappedPropName('readonly')).toEqual('readOnly'); });
        testing_internal_1.it('should not re-map property names that are not specified in DOM facade', function () {
            testing_internal_1.expect(registry.getMappedPropName('title')).toEqual('title');
            testing_internal_1.expect(registry.getMappedPropName('exotic-unknown')).toEqual('exotic-unknown');
        });
    });
}
exports.main = main;
//# sourceMappingURL=dom_element_schema_registry_spec.js.map