import { RenderTemplateCmd, RenderComponentTemplate } from './api';
import { DefaultRenderView } from './view';
export declare function encapsulateStyles(componentTemplate: RenderComponentTemplate): string[];
export declare function createRenderView(componentTemplate: RenderComponentTemplate, cmds: RenderTemplateCmd[], inplaceElement: any, nodeFactory: NodeFactory<any>): DefaultRenderView<any>;
export interface NodeFactory<N> {
    resolveComponentTemplate(templateId: string): RenderComponentTemplate;
    createTemplateAnchor(attrNameAndValues: string[]): N;
    createElement(name: string, attrNameAndValues: string[]): N;
    createRootContentInsertionPoint(): N;
    mergeElement(existing: N, attrNameAndValues: string[]): any;
    createShadowRoot(host: N, templateId: string): N;
    createText(value: string): N;
    appendChild(parent: N, child: N): any;
    on(element: N, eventName: string, callback: Function): any;
    globalOn(target: string, eventName: string, callback: Function): Function;
}
export declare const COMPONENT_VARIABLE: string;
export declare const HOST_ATTR: string;
export declare const CONTENT_ATTR: string;
