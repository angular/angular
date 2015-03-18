import {isPresent, isBlank, RegExpWrapper, BaseException} from 'angular2/src/facade/lang';
import {MapWrapper} from 'angular2/src/facade/collection';

import {Parser, AST, ExpressionWithSource} from 'angular2/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
// Group 1 = "bind"
// Group 2 = "var"
// Group 3 = "on"
// Group 4 = the identifier after "bind", "var", or "on"
// Group 5 = idenitifer inside square braces
// Group 6 = identifier inside parenthesis
// Group 7 = "#"
// Group 8 = identifier after "#"
var BIND_NAME_REGEXP = RegExpWrapper.create(
    '^(?:(?:(bind)|(var)|(on))-(.+))|\\[([^\\]]+)\\]|\\(([^\\)]+)\\)|(#)(.+)');

/**
 * Parses the property bindings on a single element.
 *
 * Fills:
 * - CompileElement#propertyBindings
 * - CompileElement#eventBindings
 * - CompileElement#variableBindings
 */
export class PropertyBindingParser extends CompileStep {
  _parser:Parser;
  constructor(parser:Parser) {
    super();
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (current.ignoreBindings) {
      return;
    }

    var attrs = current.attrs();
    var newAttrs = MapWrapper.create();
    var desc = current.elementDescription;

    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
      if (isPresent(bindParts)) {
        if (isPresent(bindParts[1])) {
          // match: bind-prop
          current.addPropertyBinding(bindParts[4], this._parseBinding(attrValue, desc));
          MapWrapper.set(newAttrs, bindParts[4], attrValue);
        } else if (isPresent(bindParts[2]) || isPresent(bindParts[7])) {
          // match: var-name / var-name="iden" / #name / #name="iden"
          var identifier = (isPresent(bindParts[4]) && bindParts[4] !== '') ?
              bindParts[4] : bindParts[8];
          var value = attrValue == '' ? '\$implicit' : attrValue;
          current.addVariableBinding(identifier, value);
          MapWrapper.set(newAttrs, identifier, value);
        } else if (isPresent(bindParts[3])) {
          // match: on-event
          current.addEventBinding(bindParts[4], this._parseAction(attrValue, desc));
        } else if (isPresent(bindParts[5])) {
          // match: [prop]
          current.addPropertyBinding(bindParts[5], this._parseBinding(attrValue, desc));
          MapWrapper.set(newAttrs, bindParts[5], attrValue);
        } else if (isPresent(bindParts[6])) {
          // match: (event)
          current.addEventBinding(bindParts[6], this._parseAction(attrValue, desc));
        }
      } else {
        var ast = this._parseInterpolation(attrValue, desc);
        if (isPresent(ast)) {
          current.addPropertyBinding(attrName, ast);
        }
      }
    });

    MapWrapper.forEach(newAttrs, (attrValue, attrName) => {
      MapWrapper.set(attrs, attrName, attrValue);
    });
  }

  _parseInterpolation(input:string, location:string):AST {
    return this._parser.parseInterpolation(input, location);
  }

  _parseBinding(input:string, location:string):AST {
    return this._parser.parseBinding(input, location);
  }

  _parseAction(input:string, location:string):AST {
    return this._parser.parseAction(input, location);
  }
}
