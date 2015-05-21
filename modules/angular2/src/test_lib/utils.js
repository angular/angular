import {List, ListWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent} from 'angular2/src/facade/lang';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';
import {BindingRecord, ChangeDetectorDefinition, Lexer, Parser} from 'angular2/change_detection';

export class Log {
  _result:List;

  constructor() {
    this._result = [];
  }

  add(value):void {
    ListWrapper.push(this._result, value);
  }

  fn(value) {
    return (a1 = null, a2 = null, a3 = null, a4 = null, a5 = null) => {
      ListWrapper.push(this._result, value);
    }
  }

  result():string {
    return ListWrapper.join(this._result, "; ");
  }
}

export function viewRootNodes(view):List {
  return resolveInternalDomView(view.render).rootNodes;
}

export function queryView(view, selector:string) {
  var rootNodes = viewRootNodes(view);
  for (var i = 0; i < rootNodes.length; ++i) {
    var res = DOM.querySelector(rootNodes[i], selector);
    if (isPresent(res)) {
      return res;
    }
  }
  return null;
}

export function dispatchEvent(element, eventType) {
  DOM.dispatchEvent(element, DOM.createEvent(eventType));
}

export function el(html:string) {
  return DOM.firstChild(DOM.content(DOM.createTemplate(html)));
}

export class ChangeDetectorDefFactory {
  _parser: Parser;

  constructor(parser: Parser) {
    this._parser = parser;
    if (this._parser == null) {
      this._parser = new Parser(new Lexer());
    }
  }

  forConstBind(propName: string, expression: string): ChangeDetectorDefinition {
    var ast = this._parser.parseBinding(expression, 'location');
    var bindingRecords = [BindingRecord.createForElement(ast, 0, propName)];

    var id = null;
    var strategy = null;
    var variableBindings = [];
    var directiveRecords = [];
    return new ChangeDetectorDefinition(
        id, strategy, variableBindings, bindingRecords, directiveRecords);
  }
}
