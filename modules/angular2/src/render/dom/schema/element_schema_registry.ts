export class ElementSchemaRegistry {
  hasProperty(elm: any, propName: string): boolean { return true; }
  getMappedPropName(propName: string): string { return propName; }
  hasEvent(elm: any, eventName: string): boolean { return true; }
}
