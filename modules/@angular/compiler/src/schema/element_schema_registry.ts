import {SecurityContext} from '@angular/core';

export class ElementSchemaRegistry {
  hasProperty(tagName: string, propName: string): boolean { return true; }
  securityContext(tagName: string, propName: string): SecurityContext {
    // FIXME(martinprobst): there should not be a no-op default implementation here.
    return SecurityContext.NONE;
  }
  getMappedPropName(propName: string): string { return propName; }
}
