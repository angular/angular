import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {List, Map} from 'angular2/src/facade/collection';

import {ElementSchemaEntry} from './element_schema_entry';

export class ElementSchemaRegistry {
  hasProperty(elName: string, propName: string): boolean { return true; }

  getMappedPropName(elName: string, propName: string): string { return propName; }
}

export class SchemaRegistryError extends BaseException {
  constructor(message) { super(message); }
}

export class ElementSchemaRegistryImpl extends ElementSchemaRegistry {
  private _schema: Map<string, ElementSchemaEntry> = new Map();

  constructor(entries: List<ElementSchemaEntry>) {
    super();
    entries.forEach((entry) => this._schema.set(entry.tagName, entry));
  }

  hasProperty(elName: string, propName: string): boolean {
    var entry = this.getEntry(elName);

    while (!entry.hasProperty(propName) && isPresent(entry.extendsElement)) {
      entry = this.getEntry(entry.extendsElement);
    }

    return entry.hasProperty(propName);
  }

  getMappedPropName(elName: string, propName: string): string {
    var entry = this.getEntry(elName);
    var mappedPropName = entry.getMappedPropName(propName);

    while (!isPresent(mappedPropName) && isPresent(entry.extendsElement)) {
      entry = this.getEntry(entry.extendsElement);
      mappedPropName = entry.getMappedPropName(propName);
    }

    return isPresent(mappedPropName) ? mappedPropName : propName;
  }

  getEntry(tagName: string): ElementSchemaEntry {
    var entry = this._schema.get(tagName);
    if (!isPresent(entry)) {
      entry = this.handleEntryNotFound(tagName);
      if (isPresent(entry)) {
        this._schema.set(tagName, entry);
      }
    }
    return entry;
  }

  handleEntryNotFound(tagName: string): ElementSchemaEntry {
    throw new SchemaRegistryError(`Missing schema entry for '${tagName}'`);
  }
}
