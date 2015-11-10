library angular2.src.core.change_detection.binding_record;

import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/core/reflection/types.dart" show SetterFn;
import "parser/ast.dart" show AST;
import "directive_record.dart" show DirectiveIndex, DirectiveRecord;

const DIRECTIVE_LIFECYCLE = "directiveLifecycle";
const BINDING = "native";
const DIRECTIVE = "directive";
const ELEMENT_PROPERTY = "elementProperty";
const ELEMENT_ATTRIBUTE = "elementAttribute";
const ELEMENT_CLASS = "elementClass";
const ELEMENT_STYLE = "elementStyle";
const TEXT_NODE = "textNode";
const EVENT = "event";
const HOST_EVENT = "hostEvent";

class BindingTarget {
  String mode;
  num elementIndex;
  String name;
  String unit;
  String debug;
  BindingTarget(
      this.mode, this.elementIndex, this.name, this.unit, this.debug) {}
  bool isDirective() {
    return identical(this.mode, DIRECTIVE);
  }

  bool isElementProperty() {
    return identical(this.mode, ELEMENT_PROPERTY);
  }

  bool isElementAttribute() {
    return identical(this.mode, ELEMENT_ATTRIBUTE);
  }

  bool isElementClass() {
    return identical(this.mode, ELEMENT_CLASS);
  }

  bool isElementStyle() {
    return identical(this.mode, ELEMENT_STYLE);
  }

  bool isTextNode() {
    return identical(this.mode, TEXT_NODE);
  }
}

class BindingRecord {
  String mode;
  BindingTarget target;
  dynamic implicitReceiver;
  AST ast;
  SetterFn setter;
  String lifecycleEvent;
  DirectiveRecord directiveRecord;
  BindingRecord(this.mode, this.target, this.implicitReceiver, this.ast,
      this.setter, this.lifecycleEvent, this.directiveRecord) {}
  bool isDirectiveLifecycle() {
    return identical(this.mode, DIRECTIVE_LIFECYCLE);
  }

  bool callOnChanges() {
    return isPresent(this.directiveRecord) &&
        this.directiveRecord.callOnChanges;
  }

  bool isDefaultChangeDetection() {
    return isBlank(this.directiveRecord) ||
        this.directiveRecord.isDefaultChangeDetection();
  }

  static BindingRecord createDirectiveDoCheck(DirectiveRecord directiveRecord) {
    return new BindingRecord(
        DIRECTIVE_LIFECYCLE, null, 0, null, null, "DoCheck", directiveRecord);
  }

  static BindingRecord createDirectiveOnInit(DirectiveRecord directiveRecord) {
    return new BindingRecord(
        DIRECTIVE_LIFECYCLE, null, 0, null, null, "OnInit", directiveRecord);
  }

  static BindingRecord createDirectiveOnChanges(
      DirectiveRecord directiveRecord) {
    return new BindingRecord(
        DIRECTIVE_LIFECYCLE, null, 0, null, null, "OnChanges", directiveRecord);
  }

  static BindingRecord createForDirective(AST ast, String propertyName,
      SetterFn setter, DirectiveRecord directiveRecord) {
    var elementIndex = directiveRecord.directiveIndex.elementIndex;
    var t = new BindingTarget(
        DIRECTIVE, elementIndex, propertyName, null, ast.toString());
    return new BindingRecord(
        DIRECTIVE, t, 0, ast, setter, null, directiveRecord);
  }

  static BindingRecord createForElementProperty(
      AST ast, num elementIndex, String propertyName) {
    var t = new BindingTarget(
        ELEMENT_PROPERTY, elementIndex, propertyName, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static BindingRecord createForElementAttribute(
      AST ast, num elementIndex, String attributeName) {
    var t = new BindingTarget(
        ELEMENT_ATTRIBUTE, elementIndex, attributeName, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static BindingRecord createForElementClass(
      AST ast, num elementIndex, String className) {
    var t = new BindingTarget(
        ELEMENT_CLASS, elementIndex, className, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static BindingRecord createForElementStyle(
      AST ast, num elementIndex, String styleName, String unit) {
    var t = new BindingTarget(
        ELEMENT_STYLE, elementIndex, styleName, unit, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static BindingRecord createForHostProperty(
      DirectiveIndex directiveIndex, AST ast, String propertyName) {
    var t = new BindingTarget(ELEMENT_PROPERTY, directiveIndex.elementIndex,
        propertyName, null, ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static BindingRecord createForHostAttribute(
      DirectiveIndex directiveIndex, AST ast, String attributeName) {
    var t = new BindingTarget(ELEMENT_ATTRIBUTE, directiveIndex.elementIndex,
        attributeName, null, ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static BindingRecord createForHostClass(
      DirectiveIndex directiveIndex, AST ast, String className) {
    var t = new BindingTarget(ELEMENT_CLASS, directiveIndex.elementIndex,
        className, null, ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static BindingRecord createForHostStyle(
      DirectiveIndex directiveIndex, AST ast, String styleName, String unit) {
    var t = new BindingTarget(ELEMENT_STYLE, directiveIndex.elementIndex,
        styleName, unit, ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static BindingRecord createForTextNode(AST ast, num elementIndex) {
    var t =
        new BindingTarget(TEXT_NODE, elementIndex, null, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static BindingRecord createForEvent(
      AST ast, String eventName, num elementIndex) {
    var t =
        new BindingTarget(EVENT, elementIndex, eventName, null, ast.toString());
    return new BindingRecord(EVENT, t, 0, ast, null, null, null);
  }

  static BindingRecord createForHostEvent(
      AST ast, String eventName, DirectiveRecord directiveRecord) {
    var directiveIndex = directiveRecord.directiveIndex;
    var t = new BindingTarget(HOST_EVENT, directiveIndex.elementIndex,
        eventName, null, ast.toString());
    return new BindingRecord(
        HOST_EVENT, t, directiveIndex, ast, null, null, directiveRecord);
  }
}
