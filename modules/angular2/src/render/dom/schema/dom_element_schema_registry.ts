import {isPresent, RegExpWrapper} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {ElementSchemaRegistry} from './element_schema_registry';

var STANDARD_EL_EVENT_REGEXP = /^[a-zA-Z]+$/g;
var CUSTOM_EL_EVENT_REGEXP = /^[\w$-]+$/g;

export class DomElementSchemaRegistry extends ElementSchemaRegistry {
  hasProperty(elm: any, propName: string): boolean {
    if (this._isCustomLikeElement(elm)) {
      // can't tell now as we don't know which properties a custom element will get
      // once it is instantiated
      return true;
    } else {
      return DOM.hasProperty(elm, propName);
    }
  }

  getMappedPropName(propName: string): string {
    var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, propName);
    return isPresent(mappedPropName) ? mappedPropName : propName;
  }

  hasEvent(elm: any, eventName: string): boolean {
    if (this._isCustomLikeElement(elm)) {
      // All the existing events on existing standard elements use English letters only
      return RegExpWrapper.test(CUSTOM_EL_EVENT_REGEXP, eventName);
    } else {
      // DOM / custom elements specs puts almost no constraints on "valid" custom event names.
      // In ng2 we are more restrictive and allow only "reasonably common" characters.
      // This is done to report errors for common mistakes.
      return RegExpWrapper.test(STANDARD_EL_EVENT_REGEXP, eventName);
    }
  }

  private _isCustomLikeElement(elm: any): boolean {
    var tagName = DOM.tagName(elm);
    // For now we don't have a perfect way of detecting custom components so we assume that
    // anything with - is a potential custom element
    return tagName.indexOf('-') !== -1;
  }
}
