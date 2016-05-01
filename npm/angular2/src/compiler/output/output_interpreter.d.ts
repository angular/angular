import * as o from './output_ast';
export declare function interpretStatements(statements: o.Statement[], resultVar: string, instanceFactory: InstanceFactory): any;
export interface InstanceFactory {
    createInstance(superClass: any, clazz: any, constructorArgs: any[], props: Map<string, any>, getters: Map<string, Function>, methods: Map<string, Function>): DynamicInstance;
}
export declare abstract class DynamicInstance {
    props: Map<string, any>;
    getters: Map<string, Function>;
    methods: Map<string, any>;
    clazz: any;
}
