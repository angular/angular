import {Injectable} from '@angular/core';
import {ElementSchemaRegistry} from './element_schema_registry';


@Injectable()
export class DomElementSchemaRegistry extends ElementSchemaRegistry {


  hasProperty(tagName: string, propName: string): boolean {
    return true;
  }

  getMappedPropName(propName: string): string {
    return propName;
  }
}
