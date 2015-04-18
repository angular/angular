import {isPresent, RegExpWrapper} from 'angular2/src/facade/lang';
import {MapWrapper} from 'angular2/src/facade/collection';

import {Parser} from 'angular2/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {dashCaseToCamelCase} from '../util';

// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = the identifier after "bind-", "var-/#", or "on-"
// Group 5 = idenitifer inside square braces
// Group 6 = identifier inside parenthesis
var BIND_NAME_REGEXP = RegExpWrapper.create(
    '^(?:(?:(?:(bind-)|(var-|#)|(on-))(.+))|\\[([^\\]]+)\\]|\\(([^\\)]+)\\))$');

/**
 * Parses the property bindings on a single element.
 */
export class PropertyBindingParser extends CompileStep {
  _parser:Parser;

  constructor(parser:Parser) {
    super();
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    var newAttrs = MapWrapper.create();

    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
      if (isPresent(bindParts)) {
        if (isPresent(bindParts[1])) {
          // match: bind-prop
          this._bindProperty(bindParts[4], attrValue, current, newAttrs);
        } else if (isPresent(bindParts[2])) {
          // match: var-name / var-name="iden" / #name / #name="iden"
          var identifier = bindParts[4];
          var value = attrValue == '' ? '\$implicit' : attrValue;
          this._bindVariable(identifier, value, current, newAttrs);
        } else if (isPresent(bindParts[3])) {
          // match: on-event
          this._bindEvent(bindParts[4], attrValue, current, newAttrs);
        } else if (isPresent(bindParts[5])) {
          // match: [prop]
          this._bindProperty(bindParts[5], attrValue, current, newAttrs);
        } else if (isPresent(bindParts[6])) {
          // match: (event)
          this._bindEvent(bindParts[6], attrValue, current, newAttrs);
        }
      } else {
        var expr = this._parser.parseInterpolation(
          attrValue, current.elementDescription
        );
        if (isPresent(expr)) {
          this._bindPropertyAst(attrName, expr, current, newAttrs);
        }
      }
    });

    MapWrapper.forEach(newAttrs, (attrValue, attrName) => {
      MapWrapper.set(attrs, attrName, attrValue);
    });
  }

  _bindVariable(identifier, value, current:CompileElement, newAttrs) {
    current.bindElement().bindVariable(dashCaseToCamelCase(identifier), value);
    MapWrapper.set(newAttrs, identifier, value);
  }

  _bindProperty(name, expression, current:CompileElement, newAttrs) {
    this._bindPropertyAst(
      name,
      this._parser.parseBinding(expression, current.elementDescription),
      current,
      newAttrs
    );
  }

  _bindPropertyAst(name, ast, current:CompileElement, newAttrs) {
    var binder = current.bindElement();
    var camelCaseName = dashCaseToCamelCase(name);
    binder.bindProperty(camelCaseName, ast);
    MapWrapper.set(newAttrs, name, ast.source);
  }

  _bindEvent(name, expression, current:CompileElement, newAttrs) {
    current.bindElement().bindEvent(
      dashCaseToCamelCase(name), this._parser.parseAction(expression, current.elementDescription)
    );
    // Don't detect directives for event names for now,
    // so don't add the event name to the CompileElement.attrs
  }

}
