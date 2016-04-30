import {SecurityContext} from '../security/security_context';

export class ElementSchemaRegistry {
  hasProperty(tagName: string, propName: string): boolean { return true; }
  // FIXME(martinprobst): there should not be a no-op default implementation here.
  securityContext(tagName: string, propName: string): SecurityContext {
    return SecurityContext.NONE;
  }
  getMappedPropName(propName: string): string { return propName; }
}
