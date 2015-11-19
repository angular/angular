import {Injectable} from 'angular2/src/core/di';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {ElementSchemaRegistry} from './element_schema_registry';

@Injectable()
export class DomElementSchemaRegistry extends ElementSchemaRegistry {
  private _protoElements = new Map<string, Element>();

  private _getProtoElement(tagName: string): Element {
    var element = this._protoElements.get(tagName);
    if (isBlank(element)) {
      element = DOM.createElement(tagName);
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
