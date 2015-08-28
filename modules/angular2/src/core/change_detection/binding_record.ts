import {isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {SetterFn} from 'angular2/src/core/reflection/types';
import {AST} from './parser/ast';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

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

export class BindingTarget {
  constructor(public mode: string, public elementIndex: number, public name: string,
              public unit: string, public debug: string) {}

  isDirective(): boolean { return this.mode === DIRECTIVE; }

  isElementProperty(): boolean { return this.mode === ELEMENT_PROPERTY; }

  isElementAttribute(): boolean { return this.mode === ELEMENT_ATTRIBUTE; }

  isElementClass(): boolean { return this.mode === ELEMENT_CLASS; }

  isElementStyle(): boolean { return this.mode === ELEMENT_STYLE; }

  isTextNode(): boolean { return this.mode === TEXT_NODE; }
}

export class BindingRecord {
  constructor(public mode: string, public target: BindingTarget, public implicitReceiver: any,
              public ast: AST, public setter: SetterFn, public lifecycleEvent: string,
              public directiveRecord: DirectiveRecord) {}

  isDirectiveLifecycle(): boolean { return this.mode === DIRECTIVE_LIFECYCLE; }

  callOnChanges(): boolean {
    return isPresent(this.directiveRecord) && this.directiveRecord.callOnChanges;
  }

  isDefaultChangeDetection(): boolean {
    return isBlank(this.directiveRecord) || this.directiveRecord.isDefaultChangeDetection();
  }


  static createDirectiveDoCheck(directiveRecord: DirectiveRecord): BindingRecord {
    return new BindingRecord(DIRECTIVE_LIFECYCLE, null, 0, null, null, "DoCheck", directiveRecord);
  }

  static createDirectiveOnInit(directiveRecord: DirectiveRecord): BindingRecord {
    return new BindingRecord(DIRECTIVE_LIFECYCLE, null, 0, null, null, "OnInit", directiveRecord);
  }

  static createDirectiveOnChanges(directiveRecord: DirectiveRecord): BindingRecord {
    return new BindingRecord(DIRECTIVE_LIFECYCLE, null, 0, null, null, "OnChanges",
                             directiveRecord);
  }



  static createForDirective(ast: AST, propertyName: string, setter: SetterFn,
                            directiveRecord: DirectiveRecord): BindingRecord {
    var elementIndex = directiveRecord.directiveIndex.elementIndex;
    var t = new BindingTarget(DIRECTIVE, elementIndex, propertyName, null, ast.toString());
    return new BindingRecord(DIRECTIVE, t, 0, ast, setter, null, directiveRecord);
  }



  static createForElementProperty(ast: AST, elementIndex: number,
                                  propertyName: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_PROPERTY, elementIndex, propertyName, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static createForElementAttribute(ast: AST, elementIndex: number,
                                   attributeName: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_ATTRIBUTE, elementIndex, attributeName, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static createForElementClass(ast: AST, elementIndex: number, className: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_CLASS, elementIndex, className, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }

  static createForElementStyle(ast: AST, elementIndex: number, styleName: string,
                               unit: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_STYLE, elementIndex, styleName, unit, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }



  static createForHostProperty(directiveIndex: DirectiveIndex, ast: AST,
                               propertyName: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_PROPERTY, directiveIndex.elementIndex, propertyName, null,
                              ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static createForHostAttribute(directiveIndex: DirectiveIndex, ast: AST,
                                attributeName: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_ATTRIBUTE, directiveIndex.elementIndex, attributeName, null,
                              ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static createForHostClass(directiveIndex: DirectiveIndex, ast: AST,
                            className: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_CLASS, directiveIndex.elementIndex, className, null,
                              ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }

  static createForHostStyle(directiveIndex: DirectiveIndex, ast: AST, styleName: string,
                            unit: string): BindingRecord {
    var t = new BindingTarget(ELEMENT_STYLE, directiveIndex.elementIndex, styleName, unit,
                              ast.toString());
    return new BindingRecord(BINDING, t, directiveIndex, ast, null, null, null);
  }



  static createForTextNode(ast: AST, elementIndex: number): BindingRecord {
    var t = new BindingTarget(TEXT_NODE, elementIndex, null, null, ast.toString());
    return new BindingRecord(BINDING, t, 0, ast, null, null, null);
  }



  static createForEvent(ast: AST, eventName: string, elementIndex: number): BindingRecord {
    var t = new BindingTarget(EVENT, elementIndex, eventName, null, ast.toString());
    return new BindingRecord(EVENT, t, 0, ast, null, null, null);
  }

  static createForHostEvent(ast: AST, eventName: string,
                            directiveRecord: DirectiveRecord): BindingRecord {
    var directiveIndex = directiveRecord.directiveIndex;
    var t =
        new BindingTarget(HOST_EVENT, directiveIndex.elementIndex, eventName, null, ast.toString());
    return new BindingRecord(HOST_EVENT, t, directiveIndex, ast, null, null, directiveRecord);
  }
}
