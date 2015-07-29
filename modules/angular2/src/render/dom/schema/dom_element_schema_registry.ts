import {isPresent} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {ElementSchemaRegistry} from './element_schema_registry';

export class DomElementSchemaRegistry extends ElementSchemaRegistry {
  hasProperty(elm: any, propName: string): boolean {
    var tagName = DOM.tagName(elm);
    if (tagName.indexOf('-') !== -1) {
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
}
