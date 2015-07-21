import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

export interface ElementSchemaEntry {
  tagName: string;
  extendsElement: string;
  hasProperty(propName: string): boolean;
  getMappedPropName(propName: string): string;
}

export class HashElementSchema implements ElementSchemaEntry {
  constructor(public tagName: string, private _properties: StringMap<string, string>,
              public extendsElement: string = null) {}

  hasProperty(propName: string): boolean {
    return StringMapWrapper.contains(this._properties, propName);
  }

  getMappedPropName(propName: string): string {
    return StringMapWrapper.get(this._properties, propName);
  }
}
