export declare var MODULE_SUFFIX: string;
export declare var CONST_VAR: string;
export declare function camelCaseToDashCase(input: string): string;
export declare function dashCaseToCamelCase(input: string): string;
export declare function escapeSingleQuoteString(input: string): string;
export declare function escapeDoubleQuoteString(input: string): string;
export declare function codeGenExportVariable(name: string): string;
export declare function codeGenConstConstructorCall(name: string): string;
export declare function codeGenValueFn(params: string[], value: string, fnName?: string): string;
export declare function codeGenFnHeader(params: string[], fnName?: string): string;
export declare function codeGenToString(expr: string): string;
export declare function splitAtColon(input: string, defaultValues: string[]): string[];
export declare class Statement {
    statement: string;
    constructor(statement: string);
}
export declare class Expression {
    expression: string;
    isArray: boolean;
    constructor(expression: string, isArray?: boolean);
}
export declare function escapeValue(value: any): string;
export declare function codeGenArray(data: any[]): string;
export declare function codeGenFlatArray(values: any[]): string;
export declare function codeGenStringMap(keyValueArray: any[][]): string;
export declare function addAll(source: any[], target: any[]): void;
export declare function flattenArray(source: any[], target: any[]): any[];
