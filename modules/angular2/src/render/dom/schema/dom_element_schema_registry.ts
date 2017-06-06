import {ElementSchemaEntry} from './element_schema_entry';
import {DOMElementSchema} from './dom_element_schema';
import {ElementSchemaRegistryImpl} from './element_schema_registry';

export const DEFAULT_HTML_EL_NAME = 'HTMLElement';

export class DomElementSchemaRegistry extends ElementSchemaRegistryImpl {
  constructor(entries: List<ElementSchemaEntry>,
              private _defaultElementToExtend: string = DEFAULT_HTML_EL_NAME) {
    super(entries);
  }

  handleEntryNotFound(tagName: string): ElementSchemaEntry {
    return new DOMElementSchema(tagName, this._defaultElementToExtend);
  }
}
