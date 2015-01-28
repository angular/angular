import {isPresent, isBlank, RegExpWrapper, BaseException} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {TemplateElement} from 'facade/dom';

import {Parser, AST, ExpressionWithSource} from 'change_detection/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var BIND_NAME_REGEXP = RegExpWrapper.create('^(?:(?:(bind)|(var)|(on))-(.+))|\\[([^\\]]+)\\]|\\(([^\\)]+)\\)');

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
    this._parser = parser;
    this._compilationUnit = compilationUnit;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
      if (isPresent(bindParts)) {
        if (isPresent(bindParts[1])) {
          // match: bind-prop
          current.addPropertyBinding(bindParts[4], this._parseBinding(attrValue));
        } else if (isPresent(bindParts[2])) {
          // match: let-prop
          // Note: We assume that the ViewSplitter already did its work, i.e. template directive should
          // only be present on <template> elements any more!
          if (!(current.element instanceof TemplateElement)) {
            throw new BaseException('var-* is only allowed on <template> elements!');
          }
          current.addVariableBinding(bindParts[4], attrValue);
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
