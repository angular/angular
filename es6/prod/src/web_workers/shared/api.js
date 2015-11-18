import { CONST_EXPR } from "angular2/src/facade/lang";
import { OpaqueToken } from "angular2/src/core/di";
export const ON_WEB_WORKER = CONST_EXPR(new OpaqueToken('WebWorker.onWebWorker'));
export class WebWorkerElementRef {
    constructor(renderView, boundElementIndex) {
        this.renderView = renderView;
        this.boundElementIndex = boundElementIndex;
    }
}
export class WebWorkerTemplateCmd {
    visit(visitor, context) { return null; }
}
export class WebWorkerTextCmd {
    constructor(isBound, ngContentIndex, value) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.value = value;
    }
    visit(visitor, context) {
        return visitor.visitText(this, context);
    }
}
export class WebWorkerNgContentCmd {
    constructor(index, ngContentIndex) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
    }
    visit(visitor, context) {
        return visitor.visitNgContent(this, context);
    }
}
export class WebWorkerBeginElementCmd {
    constructor(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
    }
    visit(visitor, context) {
        return visitor.visitBeginElement(this, context);
    }
}
export class WebWorkerEndElementCmd {
    visit(visitor, context) {
        return visitor.visitEndElement(context);
    }
}
export class WebWorkerBeginComponentCmd {
    constructor(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames, templateId) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.templateId = templateId;
    }
    visit(visitor, context) {
        return visitor.visitBeginComponent(this, context);
    }
}
export class WebWorkerEndComponentCmd {
    visit(visitor, context) {
        return visitor.visitEndComponent(context);
    }
}
export class WebWorkerEmbeddedTemplateCmd {
    constructor(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames, isMerged, children) {
        this.isBound = isBound;
        this.ngContentIndex = ngContentIndex;
        this.name = name;
        this.attrNameAndValues = attrNameAndValues;
        this.eventTargetAndNames = eventTargetAndNames;
        this.isMerged = isMerged;
        this.children = children;
    }
    visit(visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    }
}
//# sourceMappingURL=api.js.map