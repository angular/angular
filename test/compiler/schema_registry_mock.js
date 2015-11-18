var lang_1 = require('angular2/src/facade/lang');
var MockSchemaRegistry = (function () {
    function MockSchemaRegistry(existingProperties, attrPropMapping) {
        this.existingProperties = existingProperties;
        this.attrPropMapping = attrPropMapping;
    }
    MockSchemaRegistry.prototype.hasProperty = function (tagName, property) {
        var result = this.existingProperties[property];
        return lang_1.isPresent(result) ? result : true;
    };
    MockSchemaRegistry.prototype.getMappedPropName = function (attrName) {
        var result = this.attrPropMapping[attrName];
        return lang_1.isPresent(result) ? result : attrName;
    };
    return MockSchemaRegistry;
})();
exports.MockSchemaRegistry = MockSchemaRegistry;
//# sourceMappingURL=schema_registry_mock.js.map