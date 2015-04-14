import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {SetterFn} from 'angular2/src/reflection/types';
import {AST} from './parser/ast';
import {DirectiveRecord} from './directive_record';

const DIRECTIVE="directive";
const ELEMENT="element";
const TEXT_NODE="textNode";

export class BindingRecord {
  mode:string;
  ast:AST;

  elementIndex:number;
  propertyName:string;
  setter:SetterFn;

  directiveRecord:DirectiveRecord;

  constructor(mode:string, ast:AST, elementIndex:number, propertyName:string, setter:SetterFn, directiveRecord:DirectiveRecord) {
    this.mode = mode;
    this.ast = ast;

    this.elementIndex = elementIndex;
    this.propertyName = propertyName;
    this.setter = setter;

    this.directiveRecord = directiveRecord;
  }

  callOnChange() {
    return isPresent(this.directiveRecord) && this.directiveRecord.callOnChange;
  }

  isOnPushChangeDetection() {
    return isPresent(this.directiveRecord) && this.directiveRecord.isOnPushChangeDetection();
  }

  isDirective() {
    return this.mode === DIRECTIVE;
  }

  isElement() {
    return this.mode === ELEMENT;
  }

  isTextNode() {
    return this.mode === TEXT_NODE;
  }

  static createForDirective(ast:AST, propertyName:string, setter:SetterFn, directiveRecord:DirectiveRecord) {
    return new BindingRecord(DIRECTIVE, ast, 0, propertyName, setter, directiveRecord);
  }

  static createForElement(ast:AST, elementIndex:number, propertyName:string) {
    return new BindingRecord(ELEMENT, ast, elementIndex, propertyName, null, null);
  }

  static createForTextNode(ast:AST, elementIndex:number) {
    return new BindingRecord(TEXT_NODE, ast, elementIndex, null, null, null);
  }
}