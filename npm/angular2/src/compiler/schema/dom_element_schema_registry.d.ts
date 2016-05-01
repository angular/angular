import { ElementSchemaRegistry } from './element_schema_registry';
export declare class DomElementSchemaRegistry extends ElementSchemaRegistry {
    private _protoElements;
    private _getProtoElement(tagName);
    hasProperty(tagName: string, propName: string): boolean;
    getMappedPropName(propName: string): string;
}
