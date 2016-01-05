export declare function moduleRef(moduleUrl: any): string;
/**
 * Represents generated source code with module references. Internal to the Angular compiler.
 */
export declare class SourceModule {
    moduleUrl: string;
    sourceWithModuleRefs: string;
    constructor(moduleUrl: string, sourceWithModuleRefs: string);
    getSourceWithImports(): SourceWithImports;
}
export declare class SourceExpression {
    declarations: string[];
    expression: string;
    constructor(declarations: string[], expression: string);
}
export declare class SourceExpressions {
    declarations: string[];
    expressions: string[];
    constructor(declarations: string[], expressions: string[]);
}
/**
 * Represents generated source code with imports. Internal to the Angular compiler.
 */
export declare class SourceWithImports {
    source: string;
    imports: string[][];
    constructor(source: string, imports: string[][]);
}
