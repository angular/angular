import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {SetterFn} from 'angular2/src/reflection/types';
import {AST} from './parser/ast';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

export class EventBindingRecord {
  constructor(public name: string, public ast: AST, public directiveRecord: DirectiveRecord) {}

  get implicitReceiver() {
    if (this.directiveRecord) { return this.directiveRecord.directiveIndex; }
    return 0;
  }
}

const DIRECTIVE = "directive";
const DIRECTIVE_LIFECYCLE = "directiveLifecycle";
const ELEMENT_PROPERTY = "elementProperty";
const ELEMENT_ATTRIBUTE = "elementAttribute";
const ELEMENT_CLASS = "elementClass";
const ELEMENT_STYLE = "elementStyle";
const TEXT_NODE = "textNode";

export class PropertyBindingRecord {
  constructor(public mode: string, public implicitReceiver: any, public ast: AST,
              public elementIndex: number, public propertyName: string, public propertyUnit: string,
              public setter: SetterFn, public lifecycleEvent: string,
              public directiveRecord: DirectiveRecord) {}

  callOnChange(): boolean {
    return isPresent(this.directiveRecord) && this.directiveRecord.callOnChange;
  }

  isOnPushChangeDetection(): boolean {
    return isPresent(this.directiveRecord) && this.directiveRecord.isOnPushChangeDetection();
  }

  isDirective(): boolean { return this.mode === DIRECTIVE; }

  isDirectiveLifecycle(): boolean { return this.mode === DIRECTIVE_LIFECYCLE; }

  isElementProperty(): boolean { return this.mode === ELEMENT_PROPERTY; }

  isElementAttribute(): boolean { return this.mode === ELEMENT_ATTRIBUTE; }

  isElementClass(): boolean { return this.mode === ELEMENT_CLASS; }

  isElementStyle(): boolean { return this.mode === ELEMENT_STYLE; }

  isTextNode(): boolean { return this.mode === TEXT_NODE; }

  static createForDirective(ast: AST, propertyName: string, setter: SetterFn,
                            directiveRecord: DirectiveRecord): PropertyBindingRecord {
    return new PropertyBindingRecord(DIRECTIVE, 0, ast, 0, propertyName, null, setter, null,
                             directiveRecord);
  }

  static createDirectiveOnCheck(directiveRecord: DirectiveRecord): PropertyBindingRecord {
    return new PropertyBindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, "onCheck",
                             directiveRecord);
  }

  static createDirectiveOnInit(directiveRecord: DirectiveRecord): PropertyBindingRecord {
    return new PropertyBindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, "onInit",
                             directiveRecord);
  }

  static createDirectiveOnChange(directiveRecord: DirectiveRecord): PropertyBindingRecord {
    return new PropertyBindingRecord(DIRECTIVE_LIFECYCLE, 0, null, 0, null, null, null, "onChange",
                             directiveRecord);
  }

  static createForElementProperty(ast: AST, elementIndex: number,
                                  propertyName: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_PROPERTY, 0, ast, elementIndex, propertyName, null, null, null,
                             null);
  }

  static createForElementAttribute(ast: AST, elementIndex: number,
                                   attributeName: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_ATTRIBUTE, 0, ast, elementIndex, attributeName, null, null,
                             null, null);
  }

  static createForElementClass(ast: AST, elementIndex: number, className: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_CLASS, 0, ast, elementIndex, className, null, null, null,
                             null);
  }

  static createForElementStyle(ast: AST, elementIndex: number, styleName: string,
                               unit: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_STYLE, 0, ast, elementIndex, styleName, unit, null, null,
                             null);
  }

  static createForHostProperty(directiveIndex: DirectiveIndex, ast: AST,
                               propertyName: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_PROPERTY, directiveIndex, ast, directiveIndex.elementIndex,
                             propertyName, null, null, null, null);
  }

  static createForHostAttribute(directiveIndex: DirectiveIndex, ast: AST,
                                attributeName: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_ATTRIBUTE, directiveIndex, ast, directiveIndex.elementIndex,
                             attributeName, null, null, null, null);
  }

  static createForHostClass(directiveIndex: DirectiveIndex, ast: AST,
                            className: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_CLASS, directiveIndex, ast, directiveIndex.elementIndex,
                             className, null, null, null, null);
  }

  static createForHostStyle(directiveIndex: DirectiveIndex, ast: AST, styleName: string,
                            unit: string): PropertyBindingRecord {
    return new PropertyBindingRecord(ELEMENT_STYLE, directiveIndex, ast, directiveIndex.elementIndex,
                             styleName, unit, null, null, null);
  }

  static createForTextNode(ast: AST, elementIndex: number): PropertyBindingRecord {
    return new PropertyBindingRecord(TEXT_NODE, 0, ast, elementIndex, null, null, null, null, null);
  }
}
