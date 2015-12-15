library angular2.src.compiler.template_ast;

import "package:angular2/src/core/change_detection/change_detection.dart"
    show AST;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "directive_metadata.dart" show CompileDirectiveMetadata;
import "parse_util.dart" show ParseSourceSpan;

/**
 * An Abstract Syntax Tree node representing part of a parsed Angular template.
 */
abstract class TemplateAst {
  /**
   * The source span from which this node was parsed.
   */
  ParseSourceSpan sourceSpan;
  /**
   * Visit this node and possibly transform it.
   */
  dynamic visit(TemplateAstVisitor visitor, dynamic context);
}

/**
 * A segment of text within the template.
 */
class TextAst implements TemplateAst {
  String value;
  num ngContentIndex;
  ParseSourceSpan sourceSpan;
  TextAst(this.value, this.ngContentIndex, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitText(this, context);
  }
}

/**
 * A bound expression within the text of a template.
 */
class BoundTextAst implements TemplateAst {
  AST value;
  num ngContentIndex;
  ParseSourceSpan sourceSpan;
  BoundTextAst(this.value, this.ngContentIndex, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitBoundText(this, context);
  }
}

/**
 * A plain attribute on an element.
 */
class AttrAst implements TemplateAst {
  String name;
  String value;
  ParseSourceSpan sourceSpan;
  AttrAst(this.name, this.value, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitAttr(this, context);
  }
}

/**
 * A binding for an element property (e.g. `[property]="expression"`).
 */
class BoundElementPropertyAst implements TemplateAst {
  String name;
  PropertyBindingType type;
  AST value;
  String unit;
  ParseSourceSpan sourceSpan;
  BoundElementPropertyAst(
      this.name, this.type, this.value, this.unit, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitElementProperty(this, context);
  }
}

/**
 * A binding for an element event (e.g. `(event)="handler()"`).
 */
class BoundEventAst implements TemplateAst {
  String name;
  String target;
  AST handler;
  ParseSourceSpan sourceSpan;
  BoundEventAst(this.name, this.target, this.handler, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitEvent(this, context);
  }

  get fullName {
    if (isPresent(this.target)) {
      return '''${ this . target}:${ this . name}''';
    } else {
      return this.name;
    }
  }
}

/**
 * A variable declaration on an element (e.g. `#var="expression"`).
 */
class VariableAst implements TemplateAst {
  String name;
  String value;
  ParseSourceSpan sourceSpan;
  VariableAst(this.name, this.value, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitVariable(this, context);
  }
}

/**
 * An element declaration in a template.
 */
class ElementAst implements TemplateAst {
  String name;
  List<AttrAst> attrs;
  List<BoundElementPropertyAst> inputs;
  List<BoundEventAst> outputs;
  List<VariableAst> exportAsVars;
  List<DirectiveAst> directives;
  List<TemplateAst> children;
  num ngContentIndex;
  ParseSourceSpan sourceSpan;
  ElementAst(
      this.name,
      this.attrs,
      this.inputs,
      this.outputs,
      this.exportAsVars,
      this.directives,
      this.children,
      this.ngContentIndex,
      this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitElement(this, context);
  }

  /**
   * Whether the element has any active bindings (inputs, outputs, vars, or directives).
   */
  bool isBound() {
    return (this.inputs.length > 0 ||
        this.outputs.length > 0 ||
        this.exportAsVars.length > 0 ||
        this.directives.length > 0);
  }

  /**
   * Get the component associated with this element, if any.
   */
  CompileDirectiveMetadata getComponent() {
    return this.directives.length > 0 &&
            this.directives[0].directive.isComponent
        ? this.directives[0].directive
        : null;
  }
}

/**
 * A `<template>` element included in an Angular template.
 */
class EmbeddedTemplateAst implements TemplateAst {
  List<AttrAst> attrs;
  List<BoundEventAst> outputs;
  List<VariableAst> vars;
  List<DirectiveAst> directives;
  List<TemplateAst> children;
  num ngContentIndex;
  ParseSourceSpan sourceSpan;
  EmbeddedTemplateAst(this.attrs, this.outputs, this.vars, this.directives,
      this.children, this.ngContentIndex, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}

/**
 * A directive property with a bound value (e.g. `*ngIf="condition").
 */
class BoundDirectivePropertyAst implements TemplateAst {
  String directiveName;
  String templateName;
  AST value;
  ParseSourceSpan sourceSpan;
  BoundDirectivePropertyAst(
      this.directiveName, this.templateName, this.value, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitDirectiveProperty(this, context);
  }
}

/**
 * A directive declared on an element.
 */
class DirectiveAst implements TemplateAst {
  CompileDirectiveMetadata directive;
  List<BoundDirectivePropertyAst> inputs;
  List<BoundElementPropertyAst> hostProperties;
  List<BoundEventAst> hostEvents;
  List<VariableAst> exportAsVars;
  ParseSourceSpan sourceSpan;
  DirectiveAst(this.directive, this.inputs, this.hostProperties,
      this.hostEvents, this.exportAsVars, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitDirective(this, context);
  }
}

/**
 * Position where content is to be projected (instance of `<ng-content>` in a template).
 */
class NgContentAst implements TemplateAst {
  num index;
  num ngContentIndex;
  ParseSourceSpan sourceSpan;
  NgContentAst(this.index, this.ngContentIndex, this.sourceSpan) {}
  dynamic visit(TemplateAstVisitor visitor, dynamic context) {
    return visitor.visitNgContent(this, context);
  }
}

/**
 * Enumeration of types of property bindings.
 */
enum PropertyBindingType {
  /**
   * A normal binding to a property (e.g. `[property]="expression"`).
   */
  Property,
  /**
   * A binding to an element attribute (e.g. `[attr.name]="expression"`).
   */
  Attribute,
  /**
   * A binding to a CSS class (e.g. `[class.name]="condition"`).
   */
  Class,
  /**
   * A binding to a style rule (e.g. `[style.rule]="expression"`).
   */
  Style
}

/**
 * A visitor for [TemplateAst] trees that will process each node.
 */
abstract class TemplateAstVisitor {
  dynamic visitNgContent(NgContentAst ast, dynamic context);
  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context);
  dynamic visitElement(ElementAst ast, dynamic context);
  dynamic visitVariable(VariableAst ast, dynamic context);
  dynamic visitEvent(BoundEventAst ast, dynamic context);
  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context);
  dynamic visitAttr(AttrAst ast, dynamic context);
  dynamic visitBoundText(BoundTextAst ast, dynamic context);
  dynamic visitText(TextAst ast, dynamic context);
  dynamic visitDirective(DirectiveAst ast, dynamic context);
  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context);
}

/**
 * Visit every node in a list of [TemplateAst]s with the given [TemplateAstVisitor].
 */
List<dynamic> templateVisitAll(
    TemplateAstVisitor visitor, List<TemplateAst> asts,
    [dynamic context = null]) {
  var result = [];
  asts.forEach((ast) {
    var astResult = ast.visit(visitor, context);
    if (isPresent(astResult)) {
      result.add(astResult);
    }
  });
  return result;
}
