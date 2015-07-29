import {DOM} from 'angular2/src/dom/dom_adapter';

import {ElementSchemaEntry} from './element_schema_entry';

export class DOMElementSchema implements ElementSchemaEntry {
  private _domElement;

  constructor(public tagName: string, public extendsElement: string = null) {
    // TODO(pk): here are are creating a new DOM element for each entry which if far from being
    // optimal. Consider changing the signature of hasProperty so it takes an element - in that
    // case we would be constructing a new DOM elements only for potential web components.
    this._domElement = DOM.createElement(tagName);
  }

  hasProperty(propName: string): boolean { return DOM.hasProperty(this._domElement, propName); }

  getMappedPropName(propName: string): string { return null; }
}
