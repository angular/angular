import { OpaqueToken } from "angular2/src/core/di";
import { RenderElementRef, RenderViewRef, RenderTemplateCmd, RenderTextCmd, RenderNgContentCmd, RenderBeginElementCmd, RenderBeginComponentCmd, RenderEmbeddedTemplateCmd, RenderCommandVisitor } from "angular2/src/core/render/api";
export declare const ON_WEB_WORKER: OpaqueToken;
export declare class WebWorkerElementRef implements RenderElementRef {
    renderView: RenderViewRef;
    boundElementIndex: number;
    constructor(renderView: RenderViewRef, boundElementIndex: number);
}
export declare class WebWorkerTemplateCmd implements RenderTemplateCmd {
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerTextCmd implements RenderTextCmd {
    isBound: boolean;
    ngContentIndex: number;
    value: string;
    constructor(isBound: boolean, ngContentIndex: number, value: string);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerNgContentCmd implements RenderNgContentCmd {
    index: number;
    ngContentIndex: number;
    constructor(index: number, ngContentIndex: number);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerBeginElementCmd implements RenderBeginElementCmd {
    isBound: boolean;
    ngContentIndex: number;
    name: string;
    attrNameAndValues: string[];
    eventTargetAndNames: string[];
    constructor(isBound: boolean, ngContentIndex: number, name: string, attrNameAndValues: string[], eventTargetAndNames: string[]);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerEndElementCmd implements RenderTemplateCmd {
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerBeginComponentCmd implements RenderBeginComponentCmd {
    isBound: boolean;
    ngContentIndex: number;
    name: string;
    attrNameAndValues: string[];
    eventTargetAndNames: string[];
    templateId: string;
    constructor(isBound: boolean, ngContentIndex: number, name: string, attrNameAndValues: string[], eventTargetAndNames: string[], templateId: string);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerEndComponentCmd implements RenderTemplateCmd {
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class WebWorkerEmbeddedTemplateCmd implements RenderEmbeddedTemplateCmd {
    isBound: boolean;
    ngContentIndex: number;
    name: string;
    attrNameAndValues: string[];
    eventTargetAndNames: string[];
    isMerged: boolean;
    children: RenderTemplateCmd[];
    constructor(isBound: boolean, ngContentIndex: number, name: string, attrNameAndValues: string[], eventTargetAndNames: string[], isMerged: boolean, children: RenderTemplateCmd[]);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
