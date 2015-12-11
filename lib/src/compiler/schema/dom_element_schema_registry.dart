library angular2.src.compiler.schema.dom_element_schema_registry;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/compiler/html_tags.dart" show splitNsName;
import "element_schema_registry.dart" show ElementSchemaRegistry;

const NAMESPACE_URIS = const {
  "xlink": "http://www.w3.org/1999/xlink",
  "svg": "http://www.w3.org/2000/svg"
};

@Injectable()
class DomElementSchemaRegistry extends ElementSchemaRegistry {
  var _protoElements = new Map<String, dynamic>();
  dynamic _getProtoElement(String tagName) {
    var element = this._protoElements[tagName];
    if (isBlank(element)) {
      var nsAndName = splitNsName(tagName);
      element = isPresent(nsAndName[0])
          ? DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1])
          : DOM.createElement(nsAndName[1]);
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
