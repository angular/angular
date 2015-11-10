library angular2.src.compiler.schema.element_schema_registry;

class ElementSchemaRegistry {
  bool hasProperty(String tagName, String propName) {
    return true;
  }

  String getMappedPropName(String propName) {
    return propName;
  }
}
