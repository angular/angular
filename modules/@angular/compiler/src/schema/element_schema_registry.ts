export class ElementSchemaRegistry {
  hasProperty(tagName: string, propName: string): boolean { return true; }
  getMappedPropName(propName: string): string { return propName; }
}
