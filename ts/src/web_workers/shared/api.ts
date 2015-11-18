import {CONST_EXPR} from "angular2/src/facade/lang";
import {OpaqueToken} from "angular2/src/core/di";
import {
  RenderElementRef,
  RenderViewRef,
  RenderTemplateCmd,
  RenderTextCmd,
  RenderNgContentCmd,
  RenderBeginElementCmd,
  RenderBeginComponentCmd,
  RenderEmbeddedTemplateCmd,
  RenderCommandVisitor
} from "angular2/src/core/render/api";

export const ON_WEB_WORKER = CONST_EXPR(new OpaqueToken('WebWorker.onWebWorker'));

export class WebWorkerElementRef implements RenderElementRef {
  constructor(public renderView: RenderViewRef, public boundElementIndex: number) {}
}

export class WebWorkerTemplateCmd implements RenderTemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any { return null; }
}

export class WebWorkerTextCmd implements RenderTextCmd {
  constructor(public isBound: boolean, public ngContentIndex: number, public value: string) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitText(this, context);
  }
}

export class WebWorkerNgContentCmd implements RenderNgContentCmd {
  constructor(public index: number, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitNgContent(this, context);
  }
}

export class WebWorkerBeginElementCmd implements RenderBeginElementCmd {
  constructor(public isBound: boolean, public ngContentIndex: number, public name: string,
              public attrNameAndValues: string[], public eventTargetAndNames: string[]) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitBeginElement(this, context);
  }
}

export class WebWorkerEndElementCmd implements RenderTemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEndElement(context);
  }
}

export class WebWorkerBeginComponentCmd implements RenderBeginComponentCmd {
  constructor(public isBound: boolean, public ngContentIndex: number, public name: string,
              public attrNameAndValues: string[], public eventTargetAndNames: string[],
              public templateId: string) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitBeginComponent(this, context);
  }
}

export class WebWorkerEndComponentCmd implements RenderTemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEndComponent(context);
  }
}

export class WebWorkerEmbeddedTemplateCmd implements RenderEmbeddedTemplateCmd {
  constructor(public isBound: boolean, public ngContentIndex: number, public name: string,
              public attrNameAndValues: string[], public eventTargetAndNames: string[],
              public isMerged: boolean, public children: RenderTemplateCmd[]) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}
