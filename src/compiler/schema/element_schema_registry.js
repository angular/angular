'use strict';var ElementSchemaRegistry = (function () {
    function ElementSchemaRegistry() {
    }
    ElementSchemaRegistry.prototype.hasProperty = function (tagName, propName) { return true; };
    ElementSchemaRegistry.prototype.getMappedPropName = function (propName) { return propName; };
    return ElementSchemaRegistry;
})();
exports.ElementSchemaRegistry = ElementSchemaRegistry;
//# sourceMappingURL=element_schema_registry.js.map