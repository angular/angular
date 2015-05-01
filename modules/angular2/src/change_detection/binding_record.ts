import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {SetterFn} from 'angular2/src/reflection/types';
import {AST} from './parser/ast';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

const DIRECTIVE = "directive";
const ELEMENT = "element";
const TEXT_NODE = "textNode";

export class BindingRecord {
  constructor(public mode: string, public implicitReceiver: any, public ast: AST,
              public elementIndex: number, public propertyName: string, public setter: SetterFn,
              public directiveRecord: DirectiveRecord) {}

  callOnChange() { return isPresent(this.directiveRecord) && this.directiveRecord.callOnChange; }

  isOnPushChangeDetection() {
    return isPresent(this.directiveRecord) && this.directiveRecord.isOnPushChangeDetection();
  }

  isDirective() { return this.mode === DIRECTIVE; }

  isElement() { return this.mode === ELEMENT; }

  isTextNode() { return this.mode === TEXT_NODE; }

  static createForDirective(ast: AST, propertyName: string, setter: SetterFn,
                            directiveRecord: DirectiveRecord) {
    return new BindingRecord(DIRECTIVE, 0, ast, 0, propertyName, setter, directiveRecord);
  }

  static createForElement(ast: AST, elementIndex: number, propertyName: string) {
    return new BindingRecord(ELEMENT, 0, ast, elementIndex, propertyName, null, null);
  }

  static createForHostProperty(directiveIndex: DirectiveIndex, ast: AST, propertyName: string) {
    return new BindingRecord(ELEMENT, directiveIndex, ast, directiveIndex.elementIndex,
                             propertyName, null, null);
  }

  static createForTextNode(ast: AST, elementIndex: number) {
    return new BindingRecord(TEXT_NODE, 0, ast, elementIndex, null, null, null);
  }
}