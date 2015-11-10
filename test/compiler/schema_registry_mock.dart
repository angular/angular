library angular2.test.compiler.schema_registry_mock;

import "package:angular2/src/compiler/schema/element_schema_registry.dart"
    show ElementSchemaRegistry;
import "package:angular2/src/facade/lang.dart" show isPresent;

class MockSchemaRegistry implements ElementSchemaRegistry {
  Map<String, bool> existingProperties;
  Map<String, String> attrPropMapping;
  MockSchemaRegistry(this.existingProperties, this.attrPropMapping) {}
  bool hasProperty(String tagName, String property) {
    var result = this.existingProperties[property];
    return isPresent(result) ? result : true;
  }

  String getMappedPropName(String attrName) {
    var result = this.attrPropMapping[attrName];
    return isPresent(result) ? result : attrName;
  }
}
