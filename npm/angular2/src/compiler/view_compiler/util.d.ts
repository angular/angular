import * as o from '../output/output_ast';
import { CompileTokenMetadata, CompileDirectiveMetadata } from '../compile_metadata';
import { CompileView } from './compile_view';
export declare function getPropertyInView(property: o.Expression, callingView: CompileView, definedView: CompileView): o.Expression;
export declare function injectFromViewParentInjector(token: CompileTokenMetadata, optional: boolean): o.Expression;
export declare function getViewFactoryName(component: CompileDirectiveMetadata, embeddedTemplateIndex: number): string;
export declare function createDiTokenExpression(token: CompileTokenMetadata): o.Expression;
export declare function createFlatArray(expressions: o.Expression[]): o.Expression;
export declare function createPureProxy(fn: o.Expression, argCount: number, pureProxyProp: o.ReadPropExpr, view: CompileView): void;
