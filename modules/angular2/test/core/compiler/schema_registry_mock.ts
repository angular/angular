import {ElementSchemaRegistry} from 'angular2/src/core/compiler/schema/element_schema_registry';
import {StringMap} from 'angular2/src/core/facade/collection';
import {isPresent} from 'angular2/src/core/facade/lang';

export class MockSchemaRegistry implements ElementSchemaRegistry {
  constructor(public existingProperties: StringMap<string, boolean>,
              public attrPropMapping: StringMap<string, string>) {}
  hasProperty(tagName: string, property: string): boolean {
    var result = this.existingProperties[property];
    return isPresent(result) ? result : true;
  }

  getMappedPropName(attrName: string): string {
    var result = this.attrPropMapping[attrName];
    return isPresent(result) ? result : attrName;
  }
}
