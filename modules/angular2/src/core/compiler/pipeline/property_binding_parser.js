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
  _compilationUnit:any;
  constructor(parser:Parser, compilationUnit:any) {
    super();
    this._parser = parser;
    this._compilationUnit = compilationUnit;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (current.ignoreBindings) {
      return;
    }

    var attrs = current.attrs();
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
      if (isPresent(bindParts)) {
        if (isPresent(bindParts[1])) {
          // match: bind-prop
          current.addPropertyBinding(bindParts[4], this._parseBinding(attrValue));
        } else if (isPresent(bindParts[2]) || isPresent(bindParts[7])) {
          // match: var-name / var-name="iden" / #name / #name="iden"
          var identifier = (isPresent(bindParts[4]) && bindParts[4] !== '') ?
              bindParts[4] : bindParts[8];
          var value = attrValue == '' ? '\$implicit' : attrValue;
          current.addVariableBinding(identifier, value);
        } else if (isPresent(bindParts[3])) {
          // match: on-prop
          current.addEventBinding(bindParts[4], this._parseAction(attrValue));
        } else if (isPresent(bindParts[5])) {
          // match: [prop]
          current.addPropertyBinding(bindParts[5], this._parseBinding(attrValue));
        } else if (isPresent(bindParts[6])) {
          // match: (prop)
          current.addEventBinding(bindParts[6], this._parseBinding(attrValue));
        }
      } else {
        var ast = this._parseInterpolation(attrValue);
        if (isPresent(ast)) {
          current.addPropertyBinding(attrName, ast);
        }
      }
    });
  }

  _parseInterpolation(input:string):AST {
    return this._parser.parseInterpolation(input, this._compilationUnit);
  }

  _parseBinding(input:string):AST {
    return this._parser.parseBinding(input, this._compilationUnit);
  }

  _parseAction(input:string):AST {
    return this._parser.parseAction(input, this._compilationUnit);
  }
}
