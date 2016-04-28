import {Injectable} from 'angular2/src/core/di';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {splitNsName} from 'angular2/src/compiler/html_tags';

import {ElementSchemaRegistry} from './element_schema_registry';

const NAMESPACE_URIS =
    CONST_EXPR({'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg'});

@Injectable()
export class DomElementSchemaRegistry extends ElementSchemaRegistry {
  private _protoElements = new Map<string, Element>();

  private _getProtoElement(tagName: string): Element {
    var element = this._protoElements.get(tagName);
    if (isBlank(element)) {
      var nsAndName = splitNsName(tagName);
      element = isPresent(nsAndName[0]) ?
                    DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
                    DOM.createElement(nsAndName[1]);
      this._protoElements.set(tagName, element);
    }
    return element;
  }

  hasProperty(tagName: string, propName: string): boolean {
    if (tagName.indexOf('-') !== -1) {
      // can't tell now as we don't know which properties a custom element will get
      // once it is instantiated
      return true;
    } else {
      var elm = this._getProtoElement(tagName);
      return DOM.hasProperty(elm, propName);
    }
  }

  getMappedPropName(propName: string): string {
    var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, propName);
    return isPresent(mappedPropName) ? mappedPropName : propName;
  }
}
