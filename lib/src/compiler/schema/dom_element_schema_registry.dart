library angular2.src.compiler.schema.dom_element_schema_registry;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "element_schema_registry.dart" show ElementSchemaRegistry;

@Injectable()
class DomElementSchemaRegistry extends ElementSchemaRegistry {
  var _protoElements = new Map<String, dynamic>();
  dynamic _getProtoElement(String tagName) {
    var element = this._protoElements[tagName];
    if (isBlank(element)) {
      element = DOM.createElement(tagName);
      this._protoElements[tagName] = element;
    }
    return element;
  }

  bool hasProperty(String tagName, String propName) {
    if (!identical(tagName.indexOf("-"), -1)) {
      // can't tell now as we don't know which properties a custom element will get

      // once it is instantiated
      return true;
    } else {
      var elm = this._getProtoElement(tagName);
      return DOM.hasProperty(elm, propName);
    }
  }

  String getMappedPropName(String propName) {
    var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, propName);
    return isPresent(mappedPropName) ? mappedPropName : propName;
  }
}
