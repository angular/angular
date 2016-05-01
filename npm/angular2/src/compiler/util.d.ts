export declare var MODULE_SUFFIX: string;
export declare function camelCaseToDashCase(input: string): string;
export declare function dashCaseToCamelCase(input: string): string;
export declare function splitAtColon(input: string, defaultValues: string[]): string[];
export declare function sanitizeIdentifier(name: string): string;
export declare function visitValue(value: any, visitor: ValueVisitor, context: any): any;
export interface ValueVisitor {
    visitArray(arr: any[], context: any): any;
    visitStringMap(map: {
        [key: string]: any;
    }, context: any): any;
    visitPrimitive(value: any, context: any): any;
    visitOther(value: any, context: any): any;
}
export declare class ValueTransformer implements ValueVisitor {
    visitArray(arr: any[], context: any): any;
    visitStringMap(map: {
        [key: string]: any;
    }, context: any): any;
    visitPrimitive(value: any, context: any): any;
    visitOther(value: any, context: any): any;
}
