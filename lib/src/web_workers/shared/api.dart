library angular2.src.web_workers.shared.api;

import "package:angular2/src/core/di.dart" show OpaqueToken;
import "package:angular2/src/core/render/api.dart"
    show
        RenderElementRef,
        RenderViewRef,
        RenderTemplateCmd,
        RenderTextCmd,
        RenderNgContentCmd,
        RenderBeginElementCmd,
        RenderBeginComponentCmd,
        RenderEmbeddedTemplateCmd,
        RenderCommandVisitor;

const ON_WEB_WORKER = const OpaqueToken("WebWorker.onWebWorker");

class WebWorkerElementRef implements RenderElementRef {
  RenderViewRef renderView;
  num boundElementIndex;
  WebWorkerElementRef(this.renderView, this.boundElementIndex) {}
}

class WebWorkerTemplateCmd implements RenderTemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return null;
  }
}

class WebWorkerTextCmd implements RenderTextCmd {
  bool isBound;
  num ngContentIndex;
  String value;
  WebWorkerTextCmd(this.isBound, this.ngContentIndex, this.value) {}
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitText(this, context);
  }
}

class WebWorkerNgContentCmd implements RenderNgContentCmd {
  num index;
  num ngContentIndex;
  WebWorkerNgContentCmd(this.index, this.ngContentIndex) {}
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitNgContent(this, context);
  }
}

class WebWorkerBeginElementCmd implements RenderBeginElementCmd {
  bool isBound;
  num ngContentIndex;
  String name;
  List<String> attrNameAndValues;
  List<String> eventTargetAndNames;
  WebWorkerBeginElementCmd(this.isBound, this.ngContentIndex, this.name,
      this.attrNameAndValues, this.eventTargetAndNames) {}
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitBeginElement(this, context);
  }
}

class WebWorkerEndElementCmd implements RenderTemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitEndElement(context);
  }
}

class WebWorkerBeginComponentCmd implements RenderBeginComponentCmd {
  bool isBound;
  num ngContentIndex;
  String name;
  List<String> attrNameAndValues;
  List<String> eventTargetAndNames;
  String templateId;
  WebWorkerBeginComponentCmd(this.isBound, this.ngContentIndex, this.name,
      this.attrNameAndValues, this.eventTargetAndNames, this.templateId) {}
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitBeginComponent(this, context);
  }
}

class WebWorkerEndComponentCmd implements RenderTemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitEndComponent(context);
  }
}

class WebWorkerEmbeddedTemplateCmd implements RenderEmbeddedTemplateCmd {
  bool isBound;
  num ngContentIndex;
  String name;
  List<String> attrNameAndValues;
  List<String> eventTargetAndNames;
  bool isMerged;
  List<RenderTemplateCmd> children;
  WebWorkerEmbeddedTemplateCmd(
      this.isBound,
      this.ngContentIndex,
      this.name,
      this.attrNameAndValues,
      this.eventTargetAndNames,
      this.isMerged,
      this.children) {}
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}
