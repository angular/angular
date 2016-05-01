export class ElementSchemaRegistry {
  hasProperty(tagName: string, propName: string): boolean { return true; }
  securityContext(tagName: string, propName: string): any { return null; }
  getMappedPropName(propName: string): string { return propName; }
}
