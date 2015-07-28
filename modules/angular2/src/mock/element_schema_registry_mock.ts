import {CONST_EXPR} from 'angular2/src/facade/lang';
import {ElementSchemaRegistryImpl} from 'angular2/src/render/dom/schema/element_schema_registry';
import {ElementSchemaEntry} from 'angular2/src/render/dom/schema/element_schema_entry';

class MockElementSchemaEntry implements ElementSchemaEntry {
  constructor(public tagName: string, public extendsElement: string = null) {}

  hasProperty(propName: string): boolean { return true; }

  getMappedPropName(propName: string): string { return propName; }
}

export class MockElementSchemaRegistry extends ElementSchemaRegistryImpl {
  constructor(entries: List<ElementSchemaEntry> = CONST_EXPR([])) { super(entries); }

  handleEntryNotFound(tagName: string): ElementSchemaEntry {
    return new MockElementSchemaEntry(tagName);
  }
}
