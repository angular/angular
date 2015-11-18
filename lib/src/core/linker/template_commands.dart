library angular2.src.core.linker.template_commands;

import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/core/render/api.dart"
    show
        RenderTemplateCmd,
        RenderCommandVisitor,
        RenderBeginElementCmd,
        RenderTextCmd,
        RenderNgContentCmd,
        RenderBeginComponentCmd,
        RenderEmbeddedTemplateCmd;
import "package:angular2/src/core/metadata.dart" show ViewEncapsulation;
// Export ViewEncapsulation so that compiled templates only need to depend

// on template_commands.
export "package:angular2/src/core/metadata.dart" show ViewEncapsulation;

/**
 * A compiled host template.
 *
 * This is const as we are storing it as annotation
 * for the compiled component type.
 */
class CompiledHostTemplate {
  final CompiledComponentTemplate template;
  const CompiledHostTemplate(this.template);
}

/**
 * A compiled template.
 */
class CompiledComponentTemplate {
  final String id;
  final Function changeDetectorFactory;
  final List<TemplateCmd> commands;
  final List<String> styles;
  const CompiledComponentTemplate(
      this.id, this.changeDetectorFactory, this.commands, this.styles);
}

const EMPTY_ARR = const [];

abstract class TemplateCmd implements RenderTemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context);
}

class TextCmd implements TemplateCmd, RenderTextCmd {
  final String value;
  final bool isBound;
  final num ngContentIndex;
  const TextCmd(this.value, this.isBound, this.ngContentIndex);
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitText(this, context);
  }
}

class NgContentCmd implements TemplateCmd, RenderNgContentCmd {
  final num index;
  final num ngContentIndex;
  final bool isBound = false;
  const NgContentCmd(this.index, this.ngContentIndex);
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitNgContent(this, context);
  }
}

abstract class IBeginElementCmd extends RenderBeginElementCmd
    implements TemplateCmd {
  List<dynamic /* String | num */ > get variableNameAndValues {
    return unimplemented();
  }

  List<String> get eventTargetAndNames {
    return unimplemented();
  }

  List<Type> get directives {
    return unimplemented();
  }

  dynamic visit(RenderCommandVisitor visitor, dynamic context);
}

class BeginElementCmd
    implements TemplateCmd, IBeginElementCmd, RenderBeginElementCmd {
  final String name;
  final List<String> attrNameAndValues;
  final List<String> eventTargetAndNames;
  final List<dynamic /* String | num */ > variableNameAndValues;
  final List<Type> directives;
  final bool isBound;
  final num ngContentIndex;
  const BeginElementCmd(
      this.name,
      this.attrNameAndValues,
      this.eventTargetAndNames,
      this.variableNameAndValues,
      this.directives,
      this.isBound,
      this.ngContentIndex);
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitBeginElement(this, context);
  }
}

class EndElementCmd implements TemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitEndElement(context);
  }

  const EndElementCmd();
}

class BeginComponentCmd
    implements TemplateCmd, IBeginElementCmd, RenderBeginComponentCmd {
  final String name;
  final List<String> attrNameAndValues;
  final List<String> eventTargetAndNames;
  final List<dynamic /* String | num */ > variableNameAndValues;
  final List<Type> directives;
  final ViewEncapsulation encapsulation;
  final num ngContentIndex;
  final Function templateGetter;
  final bool isBound = true;
  const BeginComponentCmd(
      this.name,
      this.attrNameAndValues,
      this.eventTargetAndNames,
      this.variableNameAndValues,
      this.directives,
      this.encapsulation,
      this.ngContentIndex,
      // Note: the template needs to be stored as a function

      // so that we can resolve cycles
      this.templateGetter);
  String get templateId {
    return this.templateGetter().id;
  }

  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitBeginComponent(this, context);
  }
}

class EndComponentCmd implements TemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitEndComponent(context);
  }

  const EndComponentCmd();
}

class EmbeddedTemplateCmd
    implements TemplateCmd, IBeginElementCmd, RenderEmbeddedTemplateCmd {
  final List<String> attrNameAndValues;
  final List<String> variableNameAndValues;
  final List<Type> directives;
  final bool isMerged;
  final num ngContentIndex;
  final Function changeDetectorFactory;
  final List<TemplateCmd> children;
  final bool isBound = true;
  final String name = null;
  final List<String> eventTargetAndNames = EMPTY_ARR;
  const EmbeddedTemplateCmd(
      this.attrNameAndValues,
      this.variableNameAndValues,
      this.directives,
      this.isMerged,
      this.ngContentIndex,
      this.changeDetectorFactory,
      this.children);
  dynamic visit(RenderCommandVisitor visitor, dynamic context) {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}

abstract class CommandVisitor implements RenderCommandVisitor {
  dynamic visitText(TextCmd cmd, dynamic context);
  dynamic visitNgContent(NgContentCmd cmd, dynamic context);
  dynamic visitBeginElement(BeginElementCmd cmd, dynamic context);
  dynamic visitEndElement(dynamic context);
  dynamic visitBeginComponent(BeginComponentCmd cmd, dynamic context);
  dynamic visitEndComponent(dynamic context);
  dynamic visitEmbeddedTemplate(EmbeddedTemplateCmd cmd, dynamic context);
}

visitAllCommands(CommandVisitor visitor, List<TemplateCmd> cmds,
    [dynamic context = null]) {
  for (var i = 0; i < cmds.length; i++) {
    cmds[i].visit(visitor, context);
  }
}
